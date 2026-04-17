import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        core: {
          bg: '#05070C',
          panel: '#0A0E18',
          grid: '#121826',
          edge: '#1B2435',
          accent: '#6EF0FF',
          accent2: '#FF5E3A',
          warn: '#FFB020',
          danger: '#FF2D55',
          mute: '#8A99B4'
        }
      },
      fontFamily: {
        display: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px rgba(110, 240, 255, 0.25)',
        glowStrong: '0 0 80px rgba(110, 240, 255, 0.45)',
        danger: '0 0 60px rgba(255, 45, 85, 0.4)'
      },
      animation: {
        pulseCore: 'pulseCore 2.2s ease-in-out infinite',
        scan: 'scan 3s linear infinite'
      },
      keyframes: {
        pulseCore: {
          '0%,100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' }
        },
        scan: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 200%' }
        }
      }
    }
  },
  plugins: []
};

export default config;
