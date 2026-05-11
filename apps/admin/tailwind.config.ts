import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0a0a0a', 50: '#1a1a1a', 100: '#141414' },
        bone: '#f5f1ea',
        accent: { DEFAULT: '#ff5a1f', dark: '#e34a13', light: '#ff7a4d' },
        surface: { DEFAULT: '#ffffff', 50: '#fafaf8', 100: '#f1f0ec', 200: '#e5e3dc' },
        muted: '#6b6b66',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
