/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbebeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        cinema: {
          gold: '#F59E0B',
          amber: '#D97706',
          dark: '#0F172A',
          surface: '#1E293B',
          accent: '#E11D48',
          teal: '#0D9488',
        }
      }
    },
  },
  plugins: [],
}
