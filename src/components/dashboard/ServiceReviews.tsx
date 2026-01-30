import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { useGoogleReviews } from '../../hooks/useDashboardData';

export function ServiceReviews() {
  const { data, isLoading, error } = useGoogleReviews();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex items-center justify-center">
        <p className="text-slate-400">Failed to load reviews</p>
      </div>
    );
  }

  const rating = data?.rating || 0;
  const reviewCount = data?.reviewCount || 0;
  // Convert rating to sentiment percentage (5 stars = 100%)
  const sentiment = rating > 0 ? Math.round((rating / 5) * 100) : 0;

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-4 md:p-6 min-h-[200px] md:min-h-[256px] w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base md:text-lg font-semibold text-white">Google Reviews</h3>
        <span className="text-[10px] md:text-xs text-slate-400">From sheet sync</span>
      </div>

      {/* Rating Row */}
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-3xl md:text-4xl font-bold text-white">{rating || '—'}</span>
        <div className="flex flex-col">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 md:h-4 md:w-4 ${
                  star <= Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : star <= rating
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-slate-400">{reviewCount.toLocaleString()} reviews</span>
        </div>
        {/* Sentiment Circle */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90 transform">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#374151"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#22c55e"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${(sentiment / 100) * 100.5} 100.5`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
              {sentiment}%
            </span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400">Rating</span>
        </div>
      </div>

      {/* Info - condensed for bottom row */}
      <div className="flex-1 flex items-center justify-center text-slate-400 mt-3">
        {rating > 0 ? (
          <p className="text-sm text-center">
            <span className="text-white font-semibold">{rating} out of 5</span> based on {reviewCount.toLocaleString()} reviews
          </p>
        ) : (
          <div className="text-center">
            <MessageSquare className="h-6 w-6 mb-1 mx-auto" />
            <p className="text-xs">No review data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
