/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C00000",   // Bright Red
        secondary: "#FACC15", // Gold/Yellow
        dark: "#0a0a0a",      // Very dark gray
        black: "#000000",
        white: "#FFFFFF",
        pale: "#9CA3AF",      // Gray-400
        darkRed: "#7F0E0E",   // Deep red for banners
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
