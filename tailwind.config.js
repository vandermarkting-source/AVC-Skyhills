/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)', // gray-300
        input: 'var(--color-input)', // white
        ring: 'var(--color-ring)', // orange-500
        background: 'var(--color-background)', // gray-50
        foreground: 'var(--color-foreground)', // gray-900
        surface: 'var(--color-surface)', // white
        primary: {
          DEFAULT: 'var(--color-primary)', // orange-500
          foreground: 'var(--color-primary-foreground)', // white
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // orange-600
          foreground: 'var(--color-secondary-foreground)', // white
        },
        accent: {
          DEFAULT: 'var(--color-accent)', // cyan-600
          foreground: 'var(--color-accent-foreground)', // white
        },
        success: {
          DEFAULT: 'var(--color-success)', // green-500
          foreground: 'var(--color-success-foreground)', // white
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // amber-500
          foreground: 'var(--color-warning-foreground)', // white
        },
        error: {
          DEFAULT: 'var(--color-error)', // red-500
          foreground: 'var(--color-error-foreground)', // white
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red-500
          foreground: 'var(--color-destructive-foreground)', // white
        },
        muted: {
          DEFAULT: 'var(--color-muted)', // gray-100
          foreground: 'var(--color-muted-foreground)', // gray-600
        },
        card: {
          DEFAULT: 'var(--color-card)', // white
          foreground: 'var(--color-card-foreground)', // gray-900
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // white
          foreground: 'var(--color-popover-foreground)', // gray-900
        },
        text: {
          primary: 'var(--color-text-primary)', // gray-900
          secondary: 'var(--color-text-secondary)', // gray-600
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-sm)',
        modal: 'var(--shadow-md)',
        elevated: 'var(--shadow-lg)',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
      },
      transitionDuration: {
        micro: '200ms',
        disclosure: '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        disclosure: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      scale: {
        micro: '1.02',
      },
      zIndex: {
        navigation: '1000',
        dropdown: '1100',
        alert: '1200',
      },
    },
  },
  plugins: [],
};