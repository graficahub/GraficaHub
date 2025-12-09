import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f7f5",
          100: "#b3ebe3",
          200: "#80dfd1",
          300: "#4dd3bf",
          400: "#1ac7ad",
          500: "#00b89b",
          600: "#00937c",
          700: "#006e5d",
          800: "#00493e",
          900: "#00241f",
        },
        dark: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#bdbdbd",
          300: "#9e9e9e",
          400: "#757575",
          500: "#616161",
          600: "#424242",
          700: "#303030",
          800: "#212121",
          900: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
