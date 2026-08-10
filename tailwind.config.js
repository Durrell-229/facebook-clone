/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        greenLight: '#10b981',
        'hub-cyan': '#22d3ee',
        'hub-violet': '#8b5cf6',
        'hub-dark': '#0b1220',
        'hub-surface': '#0f1b2d',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
};
