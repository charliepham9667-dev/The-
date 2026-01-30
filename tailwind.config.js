/** @type {import('tailwindcss').Config} */
const colors = {
  background: {
    primary: '#0f1419',
    secondary: '#1a1f2e',
    sidebar: '#0d1117'
  },
  accent: {
    orange: '#ff6b35',
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
    blue: '#3b82f6'
  },
  border: '#374151'
};

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    // Custom xs breakpoint for very small screens
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        background: colors.background,
        accent: colors.accent,
        border: colors.border
      },
      borderColor: {
        DEFAULT: colors.border
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'sans-serif']
      }
    }
  },
  plugins: []
};
