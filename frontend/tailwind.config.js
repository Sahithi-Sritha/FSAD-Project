/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass':    '0 8px 32px rgba(0,0,0,0.06)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.08)',
        'glow-sm':  '0 2px 12px rgba(99,102,241,0.15)',
        'glow':     '0 4px 24px rgba(99,102,241,0.2)',
        'glow-lg':  '0 8px 40px rgba(99,102,241,0.25)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 8s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s ease-in-out infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'slide-up':     'slideUp 0.4s cubic-bezier(.4,0,.2,1)',
        'slide-down':   'slideDown 0.4s cubic-bezier(.4,0,.2,1)',
        'fade-in':      'fadeIn 0.5s ease-out',
        'scale-in':     'scaleIn 0.3s cubic-bezier(.4,0,.2,1)',
        'bounce-gentle':'bounceGentle 2s ease-in-out infinite',
        'gradient':     'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

