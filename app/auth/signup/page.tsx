'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email to confirm your account!');
      router.push('/auth/login');
    }
    setLoading(false);
  }

  return (
    <div className="glass p-8" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: 'var(--font-display)', color: '#e2eaf5' }}
      >
        Create workspace
      </h1>
      <p className="text-sm mb-8" style={{ color: '#7a93b4' }}>
        Start managing tasks with Aero
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
            Full Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#3d5478' }} />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
              className="aero-input pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#3d5478' }} />
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

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#3d5478' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              required
              className="aero-input pl-10"
            />
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
            <>Create Account <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: '#7a93b4' }}>
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium" style={{ color: '#38c4e8' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
