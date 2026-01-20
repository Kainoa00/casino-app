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
          dark: '#0a0a0a',      // Rich Black
          darker: '#050505',    // Pure Black
          accent: '#c41e3a',    // Crimson Red
          gold: '#d4af37',      // Metallic Gold
          green: '#10b981',     // Emerald/Felt Green
          purple: '#3b0764',    // Deep Royal Purple
          surface: '#18181b',   // Zinc 900 for cards
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
