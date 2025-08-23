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
        // ADD a full semantic palette
        success: {
          DEFAULT: '#16a34a', // green-600
          hover: '#15803d', // green-700
        },
        warning: {
          DEFAULT: '#ca8a04', // yellow-600
          hover: '#a16207', // yellow-700
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
          hover: '#b91c1b', // red-700
        },
        info: {
          DEFAULT: '#2563eb', // blue-600
          hover: '#1d4ed8', // blue-700
        },
        // You could also add neutral/gray variants
        neutral: {
          DEFAULT: '#171717', // neutral-900 for text
          secondary: '#737373', // neutral-500
          subtle: '#f5f5f5', // neutral-100 for backgrounds
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
