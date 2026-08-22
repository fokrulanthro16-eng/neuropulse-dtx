/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oled: {
          bg: '#080808',
          card: '#121212',
          surface: '#181818',
          border: '#262626',
          muted: '#8E8E93',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
          clinical: '#E5A93C', // Standard 590nm photophobia-safe warm amber
          dim: '#7C581E',
          glow: 'rgba(229, 169, 60, 0.15)',
        },
        clinical: {
          somatic: '#F59E0B',
          cognitive: '#38BDF8',
          emotional: '#A78BFA',
          sleep: '#34D399',
          danger: '#EF4444',
          safe: '#10B981',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        breathe: {
          '0%': { transform: 'scale(0.95)', opacity: '0.6' },
          '25%': { transform: 'scale(1.15)', opacity: '1' }, // Inhale hold
          '50%': { transform: 'scale(1.15)', opacity: '0.9' }, // Hold
          '75%': { transform: 'scale(0.95)', opacity: '0.6' }, // Exhale
          '100%': { transform: 'scale(0.95)', opacity: '0.6' }, // Rest hold
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'breathe-box': 'breathe 16s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
