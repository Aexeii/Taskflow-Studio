/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      colors: {
        aero: {
          bg:        '#080c14',
          surface:   '#0d1422',
          card:      '#111926',
          border:    '#1e2d45',
          muted:     '#1a2535',
          text:      '#e2eaf5',
          subtext:   '#7a93b4',
          dim:       '#3d5478',
          cyan:      '#38c4e8',
          blue:      '#4f8ef7',
          violet:    '#7c5df9',
          green:     '#34d399',
          amber:     '#f59e0b',
          red:       '#f43f5e',
          glow:      'rgba(56,196,232,0.15)',
          'glow-v':  'rgba(124,93,249,0.12)',
        },
      },
      backgroundImage: {
        'aero-gradient': 'linear-gradient(135deg, #080c14 0%, #0a1120 50%, #080e1a 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(17,25,38,0.9) 0%, rgba(13,20,34,0.85) 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #38c4e8 0%, #4f8ef7 100%)',
        'violet-gradient': 'linear-gradient(135deg, #7c5df9 0%, #4f8ef7 100%)',
        'green-gradient': 'linear-gradient(135deg, #34d399 0%, #38c4e8 100%)',
        'glow-radial': 'radial-gradient(ellipse at center, rgba(56,196,232,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'aero': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
        'aero-lg': '0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
        'glow-cyan': '0 0 20px rgba(56,196,232,0.25), 0 0 60px rgba(56,196,232,0.08)',
        'glow-violet': '0 0 20px rgba(124,93,249,0.25), 0 0 60px rgba(124,93,249,0.08)',
        'glow-green': '0 0 20px rgba(52,211,153,0.2)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,196,232,0.15)',
      },
      backdropBlur: {
        'aero': '20px',
        'aero-lg': '40px',
      },
      borderRadius: {
        'aero': '16px',
        'aero-sm': '10px',
        'aero-lg': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
