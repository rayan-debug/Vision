import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#141414',
        },
        bone: '#f5f1ea',
        accent: {
          DEFAULT: '#ff5a1f',
          dark: '#e34a13',
          light: '#ff7a4d',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'mega': ['clamp(4rem, 14vw, 14rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'super': ['clamp(3rem, 9vw, 8rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
