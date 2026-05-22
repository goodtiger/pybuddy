import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4a90e2', light: '#7ab3f0', dark: '#3570b0', container: '#d4e3ff' },
        secondary: { DEFAULT: '#4caf50', light: '#7ec97f', dark: '#378c3a' },
        accent: { DEFAULT: '#ffeb3b', light: '#fff36d', dark: '#d4c100' },
        background: '#f8f9fa',
        surface: '#ffffff',
        error: '#ff6b6b',
        success: '#4caf50',
      },
      fontFamily: {
        heading: ['var(--font-quicksand)', ...fontFamily.sans],
        body: ['var(--font-quicksand)', ...fontFamily.sans],
        code: ['var(--font-jetbrains)', ...fontFamily.mono],
      },
      borderRadius: { 'kid-sm': '8px', 'kid-md': '16px', 'kid-lg': '24px', 'kid-full': '9999px' },
      spacing: { 'touch': '44px', 'kid-sm': '16px', 'kid-md': '24px', 'kid-lg': '40px' },
      fontSize: {
        'kid-xl': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'kid-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'kid-base': ['18px', { lineHeight: '26px', fontWeight: '400' }],
        'kid-sm': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      },
      boxShadow: {
        'kid': '0 4px 8px rgba(74, 144, 226, 0.1)',
        'kid-lg': '0 8px 16px rgba(74, 144, 226, 0.15)',
        'kid-3d': '0 4px 0 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
