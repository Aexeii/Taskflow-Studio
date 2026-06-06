import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#F9F8F6]">
      {/* Soft background accents */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.01) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black shadow-lg">
              <Zap size={20} fill="white" color="white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-gray-900 font-display">
              Taskflow
            </span>
          </div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
            Minimal task management
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
