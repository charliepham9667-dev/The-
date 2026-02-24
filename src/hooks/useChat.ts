import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  senderName?: string;
}

export interface ChatRecipient {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

/** Get list of other users for DM (profiles excluding current user) */
export function useChatRecipients() {
  const profile = useAuthStore((s) => s.profile);

  return useQuery({
    queryKey: ['chat-recipients', profile?.id],
    queryFn: async (): Promise<ChatRecipient[]> => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('is_active', true)
        .neq('id', profile.id)
        .order('full_name');

      if (error) throw error;

      return (data || []).map((r) => ({
        id: r.id,
        fullName: r.full_name || 'Unknown',
        email: r.email || '',
        avatarUrl: r.avatar_url,
      }));
    },
    enabled: !!profile?.id,
  });
}

/** Get messages between current user and a recipient, with Realtime subscription */
export function useMessages(recipientId: string | null) {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat-messages', profile?.id, recipientId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!profile?.id || !recipientId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, content, created_at, read_at')
        .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender names for messages (we need profiles for senders)
      const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
      const { data: senders } = senderIds.length > 0
        ? await supabase.from('profiles').select('id, full_name').in('id', senderIds)
        : { data: [] };
      const senderMap = new Map((senders || []).map((s: any) => [s.id, s.full_name || 'Unknown']));

      return (data || []).map((row: any) => ({
        id: row.id,
        senderId: row.sender_id,
        recipientId: row.recipient_id,
        content: row.content,
        createdAt: row.created_at,
        readAt: row.read_at,
        senderName: senderMap.get(row.sender_id) || 'Unknown',
      }));
    },
    enabled: !!profile?.id && !!recipientId,
  });

  // Realtime subscription for new messages
  useEffect(() => {
    if (!profile?.id || !recipientId) return;

    const channel = supabase
      .channel(`messages:${profile.id}:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${recipientId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', profile.id, recipientId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${profile.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', profile.id, recipientId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, recipientId, queryClient]);

  return query;
}

/** Send a message to a recipient */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);

  return useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      if (!profile?.id) throw new Error('Not authenticated');
      if (!content.trim()) throw new Error('Message cannot be empty');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          recipient_id: recipientId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { recipientId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', profile?.id, recipientId] });
    },
  });
}
