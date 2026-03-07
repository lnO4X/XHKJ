import type { Config } from 'tailwindcss';

export default {
  content: [
    './components/**/*.{vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.ts',
    './plugins/**/*.ts',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F0FE',
          100: '#D0E1FD',
          200: '#A1C3FB',
          300: '#72A5F9',
          400: '#4387F7',
          500: '#0052D9',
          600: '#0042AE',
          700: '#003182',
          800: '#002157',
          900: '#00102B',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          light: '#16213E',
          lighter: '#0F3460',
        },
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Helvetica Neue"',
          'Arial',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
