import { useState, useRef, useEffect } from 'react';
import { Send, Search, MessageCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useChatRecipients, useMessages, useSendMessage } from '../hooks/useChat';
import { formatDate } from '../lib/formatters';

export function Chat() {
  const profile = useAuthStore((s) => s.profile);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: recipients, isLoading: recipientsLoading } = useChatRecipients();
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedRecipientId);
  const sendMessage = useSendMessage();

  const selectedRecipient = recipients?.find((r) => r.id === selectedRecipientId);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedRecipientId || !newMessage.trim()) return;

    try {
      await sendMessage.mutateAsync({ recipientId: selectedRecipientId, content: newMessage });
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  if (!profile) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">Please sign in to use chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-border bg-card overflow-hidden">
      {/* Sidebar - DM recipients */}
      <div className="w-64 border-r border-border flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people..."
              className="w-full rounded-lg bg-background border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span>
          </div>
          {recipientsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recipients?.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No team members to chat with.</p>
          ) : (
            <div className="space-y-1">
              {recipients?.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRecipientId(r.id)}
                  className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                    selectedRecipientId === r.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
                    {r.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <span className="truncate">{r.fullName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRecipientId ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{selectedRecipient?.fullName || 'Loading...'}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages?.map((msg) => {
                  const isOwn = msg.senderId === profile.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                          isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                        }`}
                      >
                        {(isOwn ? profile.fullName : msg.senderName || '?')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2) || '?'}
                      </div>
                      <div className={`max-w-md ${isOwn ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-medium text-foreground">
                            {isOwn ? 'You' : msg.senderName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(msg.createdAt, { includeTime: true, format: 'short' })}
                          </span>
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwn ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 border-t border-border flex items-center gap-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${selectedRecipient?.fullName || ''}`}
                className="flex-1 rounded-lg bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="rounded-lg bg-primary p-3 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">Select a person to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
