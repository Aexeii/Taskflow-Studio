'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
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

  return (
    <div className="glass p-8 w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 font-display">
        Welcome back
      </h1>
      <p className="text-sm mb-8 text-gray-500">
        Sign in to your workspace
      </p>

      {/* Google OAuth - Primary */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2.5 mb-6 py-3 rounded-xl text-sm font-medium transition-all bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100"
      >
        <Chrome size={16} />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-500">
            Email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-500">
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 mt-6 h-[44px] bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-medium text-black hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
