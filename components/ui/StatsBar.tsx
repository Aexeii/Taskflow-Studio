'use client';

interface Props {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
}

const STATS = [
  { key: 'total',      label: 'Total Tasks',   color: '#111827' },
  { key: 'done',       label: 'Completed',     color: '#10B981' },
  { key: 'inProgress', label: 'In Progress',   color: '#3B82F6' },
  { key: 'overdue',    label: 'Overdue',       color: '#EF4444' },
] as const;

export default function StatsBar({ total, done, inProgress, overdue }: Props) {
  const values = { total, done, inProgress, overdue };
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-8 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progress Card */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <div
              className="h-full rounded-full transition-all duration-700 bg-black"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ key, label, color }) => (
            <div
              key={key}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition-all hover:border-gray-200"
            >
              <div
                className="text-2xl font-bold mb-1 font-display"
                style={{ color }}
              >
                {values[key]}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
