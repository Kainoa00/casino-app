/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casino: {
          dark: '#1a1a2e',
          darker: '#16162a',
          accent: '#e94560',
          gold: '#ffd700',
          green: '#00d26a',
          purple: '#7b2cbf'
        }
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'flip': 'flip 0.6s ease-in-out'
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        }
      }
    },
  },
  plugins: [],
}
