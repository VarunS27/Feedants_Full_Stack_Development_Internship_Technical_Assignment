/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E6E6E',
          dark: '#0A5A5A',
          mid: '#127C7C',
          soft: '#E7F2F1',
          tint: '#F1F8F7',
        },
        accent: {
          green: '#E8F5EC',
          greenDark: '#1F7A4D',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#6B7280',
          soft: '#9CA3AF',
          line: '#E5E7EB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F5F7F7',
          chip: '#F1F3F4',
        },
        gold: '#F5A623',
        silver: '#B9C0C7',
        bronze: '#CD7F32',
      },
      fontSize: {
        '2xs': '10px',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
