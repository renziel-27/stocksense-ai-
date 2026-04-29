/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0E1A',
        surface: '#0F1629',
        surface2: '#141D35',
        border: '#1E2D4F',
        accent: '#2563EB',
        bullish: '#10B981',
        bearish: '#EF4444',
        bullishBg: '#064E3B22',
        bearishBg: '#7F1D1D22',
        muted: '#64748B',
        text: '#E2E8F0',
        textMuted: '#94A3B8'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
