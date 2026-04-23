'use client';

interface Props {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
}

const STATS = [
  { key: 'total',      label: 'Total Tasks',   color: '#4f8ef7', glow: 'rgba(79,142,247,0.15)'  },
  { key: 'done',       label: 'Completed',     color: '#34d399', glow: 'rgba(52,211,153,0.15)'  },
  { key: 'inProgress', label: 'In Progress',   color: '#38c4e8', glow: 'rgba(56,196,232,0.15)'  },
  { key: 'overdue',    label: 'Overdue',       color: '#f43f5e', glow: 'rgba(244,63,94,0.15)'   },
] as const;

export default function StatsBar({ total, done, inProgress, overdue }: Props) {
  const values = { total, done, inProgress, overdue };
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-6 pt-5">
      {/* Progress bar */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background: 'rgba(13,20,34,0.6)',
          border: '1px solid rgba(30,45,69,0.5)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: '#7a93b4' }}>Overall Progress</span>
          <span className="text-sm font-bold" style={{ color: '#38c4e8' }}>{pct}%</span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(30,45,69,0.6)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #38c4e8, #4f8ef7)',
              boxShadow: '0 0 12px rgba(56,196,232,0.4)',
            }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {STATS.map(({ key, label, color, glow }) => (
          <div
            key={key}
            className="rounded-2xl p-4 transition-all"
            style={{
              background: 'rgba(13,20,34,0.6)',
              border: `1px solid rgba(30,45,69,0.5)`,
            }}
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{
                fontFamily: 'var(--font-display)',
                color,
                textShadow: `0 0 20px ${color}60`,
              }}
            >
              {values[key]}
            </div>
            <div className="text-xs font-medium" style={{ color: '#7a93b4' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
