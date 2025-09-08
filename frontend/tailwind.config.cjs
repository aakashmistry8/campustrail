/**** Tailwind Config ****/
const { fontFamily } = require('tailwindcss/defaultTheme');

/**** Shadcn-style design tokens ****/
module.exports = {
  darkMode: 'class',
  content: ['index.html','./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: '#2563eb',
        background: '#f8fafc',
        foreground: '#0f172a',
        primary: { DEFAULT: '#2563eb', foreground: '#ffffff' },
        secondary: { DEFAULT: '#e2e8f0', foreground: '#0f172a' },
        muted: { DEFAULT: '#f1f5f9', foreground: '#64748b' },
        accent: { DEFAULT: '#eff6ff', foreground: '#1e3a8a' },
        destructive: { DEFAULT: '#dc2626', foreground: '#ffffff' },
        card: { DEFAULT: '#ffffff', foreground: '#0f172a' },
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem'
      },
      boxShadow: {
        soft: '0 4px 16px -2px rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.04)',
        glass: '0 8px 32px -4px rgba(15,23,42,0.12)',
      },
      backdropBlur: { xs: '2px' },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pop: { '0%': { opacity:0, transform: 'scale(.96)' }, '100%': { opacity:1, transform: 'scale(1)' } }
      },
      animation: {
        fadeIn: 'fadeIn .4s ease-out',
        pop: 'pop .25s ease-out'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
