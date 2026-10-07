/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4EFE6',
          dark: '#EAE3D6',
          deep: '#DED5C4',
        },
        ink: {
          DEFAULT: '#1C1B19',
          soft: '#4A4740',
          muted: '#7A766C',
        },
        rule: '#CFC6B5',
        accent: {
          DEFAULT: '#A63D2F',
          dark: '#842F24',
          light: '#E9C9C2',
        },
        navy: {
          DEFAULT: '#1F3A5F',
          dark: '#152842',
          light: '#C9D4E3',
        },
        ochre: {
          DEFAULT: '#B8862B',
          light: '#EEDDB8',
        },
        positive: {
          DEFAULT: '#2E6B4F',
          light: '#CFE2D6',
        },
        negative: {
          DEFAULT: '#A63D2F',
          light: '#F0D5CF',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        paper: '0 1px 0 rgba(28,27,25,0.06), 0 2px 8px rgba(28,27,25,0.06)',
        lifted: '0 4px 20px rgba(28,27,25,0.12)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
      },
    },
  },
  plugins: [],
};
