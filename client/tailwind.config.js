/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f7f6f3',
          100: '#eeecea',
          200: '#e0ddd8',
          300: '#c8c4bc',
          400: '#a8a39a',
          500: '#5a5550',
          600: '#2a2925',
          700: '#1a1917',
          800: '#111110',
          900: '#0a0a0a',
          950: '#050505',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
