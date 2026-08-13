/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#4f8af5',
          500: '#6366f1',
          600: '#5558e6',
          700: '#7a45e0',
          800: '#4c3db8',
          900: '#3730a3',
        },
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #4f8af5 0%, #6366f1 48%, #7a45e0 100%)',
        'brand-gradient-br':
          'linear-gradient(145deg, #4f8af5 0%, #6366f1 52%, #7a45e0 100%)',
      },
      boxShadow: {
        'brand-glow':
          '0 8px 26px rgba(99, 102, 241, 0.28), 0 2px 8px rgba(122, 69, 224, 0.22)',
        'brand-glow-sm':
          '0 4px 14px rgba(99, 102, 241, 0.22), 0 1px 4px rgba(122, 69, 224, 0.18)',
      },
      borderRadius: {
        btn: '9999px',
      },
    },
  },
  plugins: [],
};
