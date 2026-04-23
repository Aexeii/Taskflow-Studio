export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56,196,232,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,93,249,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #38c4e8, #4f8ef7)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L17 6V14L10 18L3 14V6L10 2Z"
                  stroke="#080c14"
                  strokeWidth="1.5"
                  fill="rgba(8,12,20,0.3)"
                />
                <circle cx="10" cy="10" r="2.5" fill="#080c14" />
              </svg>
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: '#e2eaf5' }}
            >
              Aero
            </span>
          </div>
          <p className="text-sm" style={{ color: '#7a93b4' }}>
            Futuristic task management
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
