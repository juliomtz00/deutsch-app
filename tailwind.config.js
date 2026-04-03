/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pristine: '#F5F3EE',
        'crystal-rose': '#FFD6DD',
        pink: '#FFD6DD',
        nasturtium: '#FF6B58',
        coral: '#FF6B58',
        cascade: '#2B9B8F',
        parasailing: '#1E5F57',
        'nine-iron': '#2C3338',
        primary: '#2C3338',
        'text-light': '#6B7280',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
        fraunces: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
