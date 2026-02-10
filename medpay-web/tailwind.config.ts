/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FEFDFB',
          100: '#FBF8F3',
          200: '#F5EFE5',
          300: '#E8DFCF',
        },
        sage: {
          50: '#F0F5F1',
          100: '#D4E2D7',
          200: '#A8C5AF',
          300: '#7DA888',
          400: '#5A8F67',
          500: '#3D7A4A',
          600: '#2D6139',
          700: '#1F4A2B',
          800: '#153620',
          900: '#0D2416',
        },
        terracotta: '#C67B5C',
        'dusty-rose': '#C4898A',
        'muted-gold': '#C9A962',
        sky: '#7AAFC4',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(45, 97, 57, 0.04)',
        sm: '0 2px 8px rgba(45, 97, 57, 0.06)',
        md: '0 4px 16px rgba(45, 97, 57, 0.08)',
        lg: '0 8px 32px rgba(45, 97, 57, 0.10)',
        xl: '0 16px 48px rgba(45, 97, 57, 0.12)',
        glass: '0 8px 32px rgba(45, 97, 57, 0.08), inset 0 0 0 1px rgba(255,255,255,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
        'count-up': 'countUp 1s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
