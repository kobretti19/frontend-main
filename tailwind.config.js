/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rowen: {
          blue: '#1e40af',
          dark: '#1e293b',
          light: '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
};
