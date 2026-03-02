import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 0%, 10%)",
        primary: {
          DEFAULT: "hsl(0, 0%, 10%)",
          light: "hsl(0, 0%, 30%)",
          dark: "hsl(0, 0%, 5%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 95%)",
          light: "hsl(0, 0%, 98%)",
          dark: "hsl(0, 0%, 90%)",
        },
        accent: {
          DEFAULT: "hsl(210, 100%, 50%)",
          light: "hsl(210, 100%, 60%)",
          dark: "hsl(210, 100%, 40%)",
        },
        success: "hsl(142, 71%, 45%)",
        warning: "hsl(38, 92%, 50%)",
        danger: "hsl(0, 84%, 60%)",
        border: "hsl(0, 0%, 90%)",
        muted: "hsl(0, 0%, 96%)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        "apple": "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "apple-lg": "0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        "apple": "12px",
        "apple-lg": "18px",
      },
    },
  },
  plugins: [],
};
export default config;



