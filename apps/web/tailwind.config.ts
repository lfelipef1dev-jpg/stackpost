import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#0A0A0A',
        'brand-surface': '#1A1A1A',
        'brand-elevated': '#252525',
        'brand-border': 'rgba(255, 255, 255, 0.12)',
        'brand-text': '#E6E6E6',
        'brand-text-secondary': 'rgba(230, 230, 230, 0.70)',
        'brand-accent': '#8AB4F8',
        'brand-accent-hover': '#AECBFA',
        'success': '#4ADE80',
        'error': '#F87171',
        'warning': '#FBBF24',
        'info': '#60A5FA',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 32px rgba(138,180,248,0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
