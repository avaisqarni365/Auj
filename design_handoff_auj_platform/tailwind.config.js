/**
 * AUJ — Tailwind token config (drop into a Next.js app)
 * Maps 1:1 to the AUJ design system. Use `theme.extend` so Tailwind defaults stay available.
 *
 * Dark mode: class strategy. Toggle `class="dark"` on <html>.
 * RTL: pair with `tailwindcss-rtl` or use logical properties (ms-*, me-*, ps-*, pe-*, start-*, end-*).
 */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Primary — deep green (brand = green-800)
        green: {
          50:  '#EFF6F1',
          100: '#DCEDE4',
          400: '#4FAE86',
          500: '#2A9468', // interactive / dark-mode primary
          600: '#1C7A4F',
          700: '#156440',
          800: '#0F5132', // brand
          900: '#0A3D26',
          950: '#07301E',
        },
        // Neutral — warm sand
        sand: {
          ink: '#2A2620', // strongest text
          700: '#4A4337', // body text
          500: '#7A7263', // muted text
          300: '#C9BCA6', // strong border / input border
          200: '#E6DDCE', // border
          100: '#F1EADD', // surface alt / track
          50:  '#FAF6EF', // app surface
        },
        // Accent — teal-blue (single accent)
        accent: {
          100: '#E2EEF3',
          500: '#3C86A8',
          600: '#2F6F8F', // accent
          700: '#265D78',
        },
        // Status
        success: { DEFAULT: '#1C7A4F', fg: '#156440', bg: '#DCEDE4' },
        warning: { DEFAULT: '#B5791E', fg: '#8A5A12', bg: '#F7EBD3' },
        danger:  { DEFAULT: '#B23A2E', fg: '#8F2E24', bg: '#F6E0DC' },
        info:    { DEFAULT: '#2F6F8F', fg: '#265D78', bg: '#E2EEF3' },
        // Dark-mode surfaces
        dark: {
          bg: '#11140F',
          surface: '#181C16',
          surface2: '#20251E',
          border: '#2E342A',
          text: '#ECEAE3',
          muted: '#A6A293',
        },
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],          // display / headings
        sans:  ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],     // UI / body (Latin + Latin-Ext for LT)
        arabic:['"IBM Plex Sans Arabic"', 'sans-serif'],           // AR + UR
        mono:  ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],   // BRN, prices, codes
      },
      fontSize: {
        xs:  ['12px', { lineHeight: '1.4' }],
        sm:  ['14px', { lineHeight: '1.5' }],
        base:['16px', { lineHeight: '1.6' }],
        lg:  ['18px', { lineHeight: '1.5' }],
        xl:  ['20px', { lineHeight: '1.4' }],
        '2xl':['24px',{ lineHeight: '1.3' }],
        '3xl':['30px',{ lineHeight: '1.15', letterSpacing: '-0.01em' }],
        '4xl':['36px',{ lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        '5xl':['48px',{ lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '6xl':['60px',{ lineHeight: '1.04', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        md: '8px', lg: '10px', xl: '14px', '2xl': '20px', '3xl': '28px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(42,38,32,0.06), 0 2px 8px rgba(42,38,32,0.05)',
        lg: '0 8px 24px rgba(42,38,32,0.10), 0 2px 6px rgba(42,38,32,0.06)',
        modal: '0 24px 60px rgba(42,38,32,0.22)',
        focus: '0 0 0 3px rgba(47,111,143,0.14)', // accent focus ring
      },
      // 4px base grid = Tailwind default spacing (space-1 = 4px, space-2 = 8px, ...). No override needed.
    },
  },
  plugins: [],
};
