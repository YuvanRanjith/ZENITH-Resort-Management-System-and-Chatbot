/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f3f6fb',
          100: '#e2e8f4',
          200: '#c2cee4',
          300: '#8ea6cb',
          400: '#5474a8',
          500: '#345489',
          600: '#28406d',
          700: '#1f3356',
          800: '#15243d',
          900: '#0c1729',
          950: '#070f1d',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        ivory: {
          50: '#fdfbf6',
          100: '#faf5ea',
          200: '#f5ecd6',
          300: '#ecdcb8',
          400: '#dcc389',
          500: '#c9a85f',
        },
        champagne: {
          50: '#fdfaf3',
          100: '#faf2dd',
          200: '#f3e4b6',
          300: '#ead084',
          400: '#d9b657',
          500: '#c39a3d',
          600: '#a87b2f',
          700: '#855e28',
          800: '#6c4a26',
          900: '#5a3d23',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(12, 23, 41, 0.12)',
        'soft-lg': '0 12px 40px -12px rgba(12, 23, 41, 0.18)',
        gold: '0 6px 24px -10px rgba(195, 154, 61, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
