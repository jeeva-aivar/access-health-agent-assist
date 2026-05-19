import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ah-emerald": "var(--ah-emerald)",
        "ah-moss": "var(--ah-moss)",
        "ah-celadon": "var(--ah-celadon)",
        "ah-deep": "var(--ah-deep)",
        "idfc-red": "var(--idfc-red)",
        "idfc-red-deep": "var(--idfc-red-deep)",
        "idfc-red-bright": "var(--idfc-red-bright)",
        "bg-canvas": "var(--bg-canvas)",
        "bg-card": "var(--bg-card)",
        "bg-subtle": "var(--bg-subtle)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "semantic-success": "var(--success)",
        "semantic-warning": "var(--warning)",
        "semantic-danger": "var(--danger)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
