/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#14b8a6',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },

      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      boxShadow: {
        card: '0 4px 6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};