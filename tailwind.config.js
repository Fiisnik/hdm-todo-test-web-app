/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tous les fichiers dans le dossier src
    "./public/index.html",        // Si tu as un fichier HTML dans public
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
