/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
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
        black: '#000000',
        white: '#ffffff',
        // Semantic color mappings with distinct, conventional colors
        primary: {
          DEFAULT: '#d81313', // Your brand's red
          hover: '#b91c1c', // A darker red for hover
          lightest: '#fef2f2', // Very light red for backgrounds
        },
        success: {
          DEFAULT: '#16a34a', // green-600
          hover: '#15803d', // green-700
        },
        warning: {
          DEFAULT: '#facc15', // yellow-400
          hover: '#eab308', // yellow-500
        },
        danger: {
          DEFAULT: '#dc2626', // red-600
          hover: '#b91c1c', // red-700
        },
        info: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb', // blue-600
        },
        neutral: {
          DEFAULT: '#6b7280', // neutral-500
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          subtle: '#f3f4f6', // neutral-100
        },
        // Trophy colors for leaderboard rankings
        yellow: {
          DEFAULT: '#facc15', // yellow-400
          700: '#a16207', // yellow-700
        },
        grey: {
          200: '#e5e7eb', // grey-200
          300: '#d1d5db', // grey-300
        },
      },
      boxShadow: {
        brutal: '4px 4px 0 #000000',
        'brutal-lg': '8px 8px 0 #000000',
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  plugins: [],
};
