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
        red: '#d81313',
        white: '#ffffff',
        grey: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Semantic color mappings using our three colors
        primary: {
          DEFAULT: '#d81313',
          hover: '#000000',
        },
        success: {
          DEFAULT: '#000000',
          hover: '#d81313',
        },
        warning: {
          DEFAULT: '#d81313',
          hover: '#000000',
        },
        danger: {
          DEFAULT: '#d81313',
          hover: '#000000',
        },
        info: {
          DEFAULT: '#000000',
          hover: '#d81313',
        },
        neutral: {
          DEFAULT: '#000000',
          secondary: '#6b7280', // Changed from red to grey-500
          subtle: '#ffffff',
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
