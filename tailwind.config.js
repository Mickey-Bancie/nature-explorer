/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#1F7A63', dark: '#0F5040', light: '#E8F5F0' },
        blue: { nature: '#2E86AB', light: '#F0F9FF' },
        amber: { nature: '#F4A261' },
        dark: '#1B2A2F',
        nature: '#F7F9F7',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
