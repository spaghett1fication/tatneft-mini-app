/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
      },
    },
  },
  plugins: [],
}