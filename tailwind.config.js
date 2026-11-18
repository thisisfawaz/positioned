/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'near-black': '#171717',
        'off-white': '#f8f8f8',
        brand: {
          DEFAULT: '#5B3DF5',
          dark: '#4A2FD9',
          // DRIVEN BY A CSS VARIABLE, not a literal. A hardcoded hex cannot
          // change with the theme, which is why every active nav item, badge
          // and avatar rendered as a pale box with white contents in dark
          // mode. --brand-light is #EDE9FE in light and #24242E in dark.
          light: 'var(--brand-light)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          subtle: 'var(--ink-subtle)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          sunken: 'var(--surface-sunken)',
        },
        line: 'var(--line)',
        purple: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          light: '#A78BFA',
        },
        'gray-50': '#FAFAFC',
        'gray-100': '#F5F5F9',
        'gray-200': '#EAEAF0',
        'gray-300': '#D8D8E2',
        'gray-400': '#A9A9B8',
        'gray-500': '#7A7A8C',
        'gray-600': '#5A5A6B',
        'gray-700': '#414150',
        'gray-800': '#2A2A36',
        'gray-900': '#17171F',
      },
      fontFamily: {
        'dm-sans': ['DM Sans', 'sans-serif'],
        'dm-mono': ['DM Mono', 'monospace'],
      },
      borderColor: {
        'light': '#EEEDF3',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 16px rgba(17, 24, 39, 0.04)',
        pop: '0 8px 24px rgba(17, 24, 39, 0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
