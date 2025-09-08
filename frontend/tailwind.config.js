/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 47.4% 11.2%)',
        primary: 'hsl(221.2 83.2% 53.3%)',
        'primary-foreground': 'hsl(210 40% 98%)',
        secondary: 'hsl(210 40% 96.1%)',
        'secondary-foreground': 'hsl(222.2 47.4% 11.2%)',
        muted: 'hsl(210 40% 96.1%)',
        'muted-foreground': 'hsl(215.4 16.3% 35%)',
        accent: 'hsl(210 40% 96.1%)',
        'accent-foreground': 'hsl(222.2 47.4% 11.2%)',
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(221.2 83.2% 53.3%)',
        // Dark mode tokens
  'dark-background': 'hsl(222 47% 10%)',
  'dark-foreground': 'hsl(210 40% 96%)',
  'dark-muted': 'hsl(215 25% 18%)',
  'dark-muted-foreground': 'hsl(215 20% 72%)',
        'dark-border': 'hsl(215 25% 22%)',
        'dark-accent': 'hsl(221.2 83.2% 53.3%)',
        'dark-accent-foreground': 'hsl(210 40% 98%)',
      },
      boxShadow: {
        'soft': '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'glass': '0 8px 32px -4px rgb(0 0 0 / 0.10)',
      },
      fontFamily: {
        sans: ['system-ui','sans-serif']
      },
      borderRadius: {
        xl: '1rem'
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

