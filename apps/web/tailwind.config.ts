import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': 'var(--brand-bg)',
        'brand-surface': 'var(--brand-surface)',
        'brand-elevated': 'var(--brand-elevated)',
        'brand-border': 'var(--brand-border)',
        'brand-text': 'var(--brand-text)',
        'brand-text-secondary': 'var(--brand-text-secondary)',
        'brand-accent': 'var(--brand-accent)',
        'brand-accent-hover': 'var(--brand-accent-hover)',
        'success': '#22C55E',
        'error': '#F87171',
        'warning': '#FBBF24',
        'info': '#60A5FA',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 32px rgba(138,180,248,0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};

export default config;
