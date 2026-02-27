/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50:  '#f0f7f2',
          100: '#dff0e4',
          200: '#c2e3cc',
          300: '#A8D5BA',
          400: '#84c49e',
          500: '#5fad7e',
          600: '#4a9268',
          700: '#3d7556',
          800: '#345e47',
          900: '#2c4e3c',
        },
        cream: {
          50:  '#fefcf9',
          100: '#F6F1E9',
          200: '#ede4d5',
          300: '#e0d2bc',
          400: '#cdb99a',
        },
        brown: {
          50:  '#f5f0ed',
          100: '#e8ddd7',
          200: '#d4c4b9',
          300: '#b69e8e',
          400: '#8D6E63',
          500: '#7a5d53',
          600: '#664d44',
          700: '#553f38',
          800: '#483530',
          900: '#3f2e2a',
        },
        charcoal: '#2E2E2E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft':    '0 2px 12px rgba(0,0,0,0.06)',
        'soft-md': '0 4px 20px rgba(0,0,0,0.08)',
        'soft-lg': '0 8px 32px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

