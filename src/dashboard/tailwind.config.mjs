/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        tocantins: {
          blue: '#0066B3',
          yellow: '#FFD700',
          green: '#228B22',
          white: '#FFFFFF'
        },
        dimension: {
          econ: '#10B981',
          social: '#3B82F6',
          terra: '#F59E0B',
          ambient: '#22C55E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
