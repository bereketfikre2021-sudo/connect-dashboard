import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000F33',
        accent: '#EC1C24',
        gold: '#D4AF37',
        sidebar: '#0a0f1e',
        'sidebar-hover': '#131929',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
