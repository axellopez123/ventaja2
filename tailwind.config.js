/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        retro: "9 / 16",   // 👈 tu custom ratio
        square: "1 / 1",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
        require("@tailwindcss/aspect-ratio"),

  ],
}