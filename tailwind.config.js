/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Libre Franklin", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#c70f0f",
          hover: "#b81010",
        },
      },
    },
  },
  plugins: [],
};
