/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Cores do Tocantins (inspiradas na bandeira)
        tocantins: {
          blue: '#0066B3',
          yellow: '#FFD700',
          green: '#228B22',
          white: '#FFFFFF'
        },
        // Cores das dimensões
        dimension: {
          econ: '#10B981',    // Verde esmeralda
          social: '#3B82F6',  // Azul
          terra: '#F59E0B',   // Âmbar
          ambient: '#22C55E'  // Verde
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
