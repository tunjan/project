/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Libre Franklin', 'sans-serif'],
        // ADD THIS MONO FONT STACK
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        primary: {
          DEFAULT: '#b91c1c',
          hover: '#991b1b',
        },
      },
      boxShadow: {
        brutal: '4px 4px 0 #000',
        'brutal-lg': '8px 8px 0 #000',
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  plugins: [],
};
