/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cert: {
          bg: '#EFEAE0',
          text: '#0B1124',
          navy: '#11204A',
          gold: '#C9A24C',
          watermark: '#E5DFD2',
          divider: '#A0A0A0',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
