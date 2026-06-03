/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crema: "#faf9f5",
        cremaSuave: "#f5f4f0",
        olivo: "#2e3a23",
        olivoOscuro: "#19240f",
        olivoClaro: "#d9e8c6",
        olivoMenta: "#eaf3de",
        cafeTierra: "#8f4c35",
        cafeClaro: "#fff0e8",
        salmon: "#E9967A",
        salmonLight: "#fdeee8",
        ambar: "#c47c1a",
        ambarLight: "#fff3d6",
        ambarFixed: "#fde6a0",
        lavanda: "#5c3d6e",
        lavandaLight: "#ede0f7",
        verdeMenta: "#d4edda",
        verdeVivo: "#3d7a3d",
      },
      fontFamily: {
        serif: ["'Libre Caslon Text'", "serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      borderRadius: {
        suave: "12px",
        bento: "20px",
      },
    },
  },
  plugins: [],
};
