const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './public/**/*.{html,css}',
  ],
  // remove princexml warnings by blocking properties not available in paged media
  blocklist: ['underline', 'resize'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        alegreya: ['Alegreya', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
