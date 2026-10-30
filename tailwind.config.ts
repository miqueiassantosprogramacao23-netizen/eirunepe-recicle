import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sustainable: "#2E7D32",
        trust: "#0288D1",
        canvas: "#F8F9FA",
        ink: "#1F2937",
        success: "#1B5E20",
        warning: "#F57F17",
        danger: "#C62828",
      },
    },
  },
  plugins: [],
} satisfies Config;
