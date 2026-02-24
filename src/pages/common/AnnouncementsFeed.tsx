import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Megaphone, 
  Pin, 
  MessageCircle, 
  Eye,
  Send,
  ArrowLeft,
  Loader2,
  Clock
} from 'lucide-react';
import { 
  useAnnouncements, 
  useAnnouncement,
  useAnnouncementReplies,
  useMarkAnnouncementRead,
  useCreateAnnouncementReply
} from '../../hooks/useAnnouncements';
import { useAuthStore } from '../../stores/authStore';
import type { Announcement, AnnouncementReply } from '../../types';

export function AnnouncementsFeed() {
  const { data: announcements, isLoading } = useAnnouncements();

  const pinnedAnnouncements = announcements?.filter(a => a.isPinned) || [];
  const regularAnnouncements = announcements?.filter(a => !a.isPinned) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Announcements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stay updated with team news and updates
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : announcements?.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned */}
          {pinnedAnnouncements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-warning flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned
              </h2>
              {pinnedAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          )}

          {/* Recent */}
          {regularAnnouncements.length > 0 && (
            <div className="space-y-3">
              {pinnedAnnouncements.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground">Recent</h2>
              )}
              {regularAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      to={`/announcements/${announcement.id}`}
      className={`block rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 ${
        announcement.isRead ? 'border-border' : 'border-primary/50 bg-primary/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {announcement.isPinned && (
              <Pin className="h-4 w-4 text-warning flex-shrink-0" />
            )}
            <h3 className={`font-semibold ${announcement.isRead ? 'text-foreground' : 'text-primary'}`}>
              {announcement.title}
            </h3>
            {!announcement.isRead && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                NEW
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {announcement.body}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span>{announcement.author?.fullName || 'Unknown'}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(announcement.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {announcement.readCount || 0}
            </span>
            {announcement.allowReplies && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {announcement.replyCount || 0}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Detail View
export function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const { data: announcement, isLoading } = useAnnouncement(id || null);
  const { data: replies } = useAnnouncementReplies(id || null);
  const markRead = useMarkAnnouncementRead();
  const createReply = useCreateAnnouncementReply();
  
  const [replyText, setReplyText] = useState('');

  // Mark as read when viewing
  useEffect(() => {
    if (id && announcement && !announcement.isRead) {
      markRead.mutate(id);
    }
  }, [id, announcement?.isRead]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !id) return;

    try {
      await createReply.mutateAsync({
        announcementId: id,
        body: replyText,
      });
      setReplyText('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Announcement not found</p>
        <Link to="/announcements" className="text-primary hover:underline mt-2 inline-block">
          Back to announcements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link 
        to="/announcements"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to announcements
      </Link>

      {/* Announcement */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {announcement.isPinned && (
            <Pin className="h-4 w-4 text-warning" />
          )}
          <h1 className="text-xl font-semibold text-foreground">{announcement.title}</h1>
        </div>

        <p className="text-foreground/80 whitespace-pre-wrap">{announcement.body}</p>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-sm text-muted-foreground">
          <span>By {announcement.author?.fullName || 'Unknown'}</span>
          <span>{formatDate(announcement.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {announcement.readCount || 0} read
          </span>
        </div>
      </div>

      {/* Replies */}
      {announcement.allowReplies && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Replies ({replies?.length || 0})
            </h2>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmitReply} className="p-4 border-b border-border">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                  {profile?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!replyText.trim() || createReply.isPending}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {createReply.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Replies List */}
          {replies && replies.length > 0 ? (
            <div className="divide-y divide-border">
              {replies.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReplyCard({ reply }: { reply: AnnouncementReply }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {reply.author?.avatarUrl ? (
            <img 
              src={reply.author.avatarUrl} 
              alt="" 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
              {reply.author?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {reply.author?.fullName || 'Unknown'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(reply.createdAt)}
            </span>
            {reply.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          <p className="text-sm text-foreground/80 mt-1">{reply.body}</p>
        </div>
      </div>
    </div>
  );
}
