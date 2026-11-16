/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0b132b',
          950: '#0e1117',
          800: '#1c2541',
        },
        neon: {
          cyan: '#6fffe9',
          red: '#ff4b4b',
          teal: '#5bc0be',
        },
      },
      fontFamily: {
        sans: ['Kanit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(111, 255, 233, 0.5), 0 0 40px rgba(111, 255, 233, 0.25)',
        'neon-cyan-strong': '0 0 30px rgba(111, 255, 233, 0.8), 0 0 60px rgba(111, 255, 233, 0.45)',
        'neon-red': '0 0 20px rgba(255, 75, 75, 0.55), 0 0 45px rgba(255, 75, 75, 0.3)',
        'neon-red-strong': '0 0 35px rgba(255, 75, 75, 0.85), 0 0 70px rgba(255, 75, 75, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
