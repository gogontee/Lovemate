// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        softpink: "#fdf2f8",       // slightly darker rose-pink
        primary: "#e11d48",
        primaryDark: "#9f1239",
        lightgray: "#485765ff",    // subtle dark gray-blue
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
