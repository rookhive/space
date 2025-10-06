import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.tsx', '../../packages/ui/src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
      },
      animation: {
        pulse: 'pulse 2s ease-out infinite',
        'pulse-scale': 'pulse-scale 2.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(0.75, 0)' },
          '50%': { transform: 'scale(1, 1)' },
        },
        pulse: {
          '50%': { opacity: '0.25' },
        },
      },
    },
  },
} satisfies Config;
