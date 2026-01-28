interface TargetCardProps {
  percentage: number;
  status: string;
}

export function TargetCard({ percentage, status }: TargetCardProps) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-xl border border-[#374151] bg-[#1a1f2e] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            TARGET MET
          </p>
          <div className="mt-3 flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90 transform">
                <circle
                  cx="32"
                  cy="32"
                  r="36"
                  stroke="#374151"
                  strokeWidth="6"
                  fill="none"
                  className="h-16 w-16"
                  style={{ transform: 'scale(0.89)', transformOrigin: 'center' }}
                />
                <circle
                  cx="32"
                  cy="32"
                  r="36"
                  stroke="#ff6b35"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    transform: 'scale(0.89)',
                    transformOrigin: 'center',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{percentage}%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{status}</p>
            </div>
          </div>
        </div>
        <div className="rounded-full bg-[#ff6b35]/20 p-1">
          <div className="h-2 w-2 rounded-full bg-[#ff6b35]" />
        </div>
      </div>
    </div>
  );
}
