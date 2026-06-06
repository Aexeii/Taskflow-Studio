'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function handleGithub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="glass p-8 w-full max-w-md" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: 'var(--font-display)', color: '#e2eaf5' }}
      >
        Welcome back
      </h1>
      <p className="text-sm mb-8" style={{ color: '#7a93b4' }}>
        Sign in to your workspace
      </p>

      {/* Google OAuth - Primary */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2.5 mb-3 py-3 rounded-aero-sm text-sm font-medium transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(56,196,232,0.2), rgba(79,142,247,0.2))',
          border: '1px solid rgba(56,196,232,0.5)',
          color: '#e2eaf5',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(56,196,232,0.3), rgba(79,142,247,0.3))';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(56,196,232,0.2), rgba(79,142,247,0.2))';
        }}
      >
        <Chrome size={16} />
        Continue with Google
      </button>

      {/* GitHub OAuth - Secondary */}
      <button
        onClick={handleGithub}
        className="w-full flex items-center justify-center gap-2.5 mb-6 py-3 rounded-aero-sm text-sm font-medium transition-all"
        style={{
          background: 'rgba(30,45,69,0.5)',
          border: '1px solid rgba(30,45,69,0.9)',
          color: '#e2eaf5',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,45,69,0.8)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,45,69,0.5)';
        }}
      >
        <Github size={16} />
        Continue with GitHub
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'rgba(30,45,69,0.8)' }} />
        <span className="text-xs" style={{ color: '#3d5478' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(30,45,69,0.8)' }} />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
            Email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#3d5478' }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="aero-input pl-10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#3d5478' }}
            />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="aero-input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: '#3d5478' }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          style={{ height: '44px' }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: '#7a93b4' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-medium transition-colors"
          style={{ color: '#38c4e8' }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
