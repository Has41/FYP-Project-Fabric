/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "dusty-grass": "linear-gradient(15deg, #FFE259 0%, #FFA751 100%)",
        "button-color": "linear-gradient(15deg, #FFE259 0%, #FFA751 100%)"
      },
      backgroundColor: {
        "custom-green": "#FFE259",
        "custom-white": "#FAF9F6"
      },
      textColor: {
        "custom-text": "#FFA751"
      },
      borderColor: {
        "custom-border": "#FFA751"
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        mont: ["Montserrat", "sans-serif"]
      }
    }
  },
  plugins: []
}
