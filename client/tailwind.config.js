/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6fb',
          100: '#d6eaf6',
          200: '#a9d0ec',
          300: '#6fb4de',
          400: '#3a93c9',
          500: '#1b73b3',
          600: '#155a91',
          700: '#114773',
          800: '#0e3a5e',
          900: '#0b2d49',
          950: '#071c30',
        },
        teal: {
          50: '#effdf9',
          100: '#c8fbed',
          200: '#92f5d8',
          300: '#56e9c0',
          400: '#25d3a6',
          500: '#0bb58a',
          600: '#039273',
          700: '#01745d',
          800: '#075c4b',
          900: '#094b3e',
          950: '#012c25',
        },
        ink: {
          50: '#f7f9fb',
          100: '#eef2f6',
          200: '#dbe3ea',
          300: '#bcc8d4',
          400: '#8d9faf',
          500: '#5d738a',
          600: '#455a72',
          700: '#394a5e',
          800: '#2f3d4f',
          900: '#1f2a37',
          950: '#141c26',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.04), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        'card-hover': '0 8px 24px -6px rgb(15 23 42 / 0.10), 0 2px 6px -2px rgb(15 23 42 / 0.06)',
        soft: '0 2px 8px 0 rgb(15 23 42 / 0.05)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
