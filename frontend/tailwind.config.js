/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f0ff',
          100: '#e3e3ff',
          200: '#c9c9ff',
          300: '#a5a5ff',
          400: '#8270ff',
          500: '#6246ea',
          600: '#5032d8',
          700: '#4425bb',
          800: '#381f99',
          900: '#2d1880',
          950: '#180d57',
        },
        neon: {
          cyan:  '#22d3ee',
          green: '#34d399',
          amber: '#fbbf24',
          red:   '#f87171',
          violet:'#a78bfa',
        },
        dark: {
          900: '#04060e',
          800: '#070b18',
          700: '#0a1020',
          600: '#0d1526',
          500: '#111d33',
          400: '#162140',
          300: '#1c2b52',
        },
      },
      backgroundImage: {
        'mesh-dark': 'radial-gradient(ellipse 80% 50% at 20% -20%, rgba(98,70,234,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(6,182,212,0.1) 0%, transparent 60%)',
        'glow-brand': 'radial-gradient(circle, rgba(98,70,234,0.4) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-brand': '0 0 30px rgba(98,70,234,0.35), 0 0 60px rgba(98,70,234,0.15)',
        'glow-cyan': '0 0 30px rgba(6,182,212,0.35)',
        'glow-green': '0 0 20px rgba(52,211,153,0.35)',
        'card': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.5), 0 0 30px rgba(98,70,234,0.12)',
        'modal': '0 24px 80px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 10px rgba(98,70,234,0.3)' },
          '50%':     { boxShadow: '0 0 35px rgba(98,70,234,0.7)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':   'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in':  'slide-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
        float:       'float 3s ease-in-out infinite',
        shimmer:     'shimmer 2s linear infinite',
        'pulse-glow':'pulse-glow 2.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'count-up':  'count-up 0.5s ease both',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
