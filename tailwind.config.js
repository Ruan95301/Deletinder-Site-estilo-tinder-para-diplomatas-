/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b',
        },
        accent: { light: '#fbbf24', DEFAULT: '#f59e0b', dark: '#d97706' },
        surface: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1' },
        ink: { DEFAULT: '#0f172a', soft: '#475569', light: '#94a3b8' },

        obsidian: '#050914',
        void: '#0a1428',
        embassy: '#0e1d38',
        electric: {
          400: '#22e8ff',
          500: '#00d4f5',
          600: '#00a8c9',
        },
        seal: {
          light: '#f4d78c',
          DEFAULT: '#d4af37',
          dark: '#9c7a1f',
        },
        diplomat: {
          400: '#ff5c94',
          500: '#ff2d78',
          600: '#d61c5f',
        },
        cream: {
          light: '#fdfaf3',
          DEFAULT: '#f7f0e1',
          deep: '#efe4c9',
          line: '#e2d2a3',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'orbit': 'orbit 14s linear infinite',
        'orbit-reverse': 'orbitReverse 20s linear infinite',
        'scan': 'scan 3s ease-in-out infinite',
        'ping-slow': 'pingSlow 2.6s cubic-bezier(0,0,0.2,1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glow: { '0%, 100%': { boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)' }, '50%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' } },
        typing: { 'from': { width: '0' }, 'to': { width: '100%' } },
        'blink-caret': { 'from, to': { borderColor: 'transparent' }, '50%': { borderColor: '#10b981' } },
        bounceSoft: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(48px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(48px) rotate(-360deg)' },
        },
        orbitReverse: {
          '0%': { transform: 'rotate(360deg) translateX(64px) rotate(-360deg)' },
          '100%': { transform: 'rotate(0deg) translateX(64px) rotate(0deg)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '50%': { transform: 'translateY(100%)' },
        },
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};