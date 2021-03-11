module.exports = {
  purge: ["./src/pages/*.tsx", "./src/components/**/*.tsx"],
  darkMode: false,
  theme: {
    extend: {},
    fontFamily: {
      'way': ['Raleway']
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
