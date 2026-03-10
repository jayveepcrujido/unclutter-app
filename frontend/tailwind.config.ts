import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#EAF1F4",
        surface: "#FFFFFF",
        "surface-hover": "#F1F6F7",
        "surface-selected": "#DDF4EE",
        border: "rgba(15, 23, 42, 0.05)",
        "border-sidebar": "rgba(15, 23, 42, 0.04)",
        "border-focus": "#0D9488",
        primary: {
          DEFAULT: "#0D9488",
          light: "#D0F1EC",
          hover: "#0B7269",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#EA580C",
          light: "#FFE6D5",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        accent: {
          DEFAULT: "#F4B63E",
          light: "#FFF3D6",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#8A96AE",
        },
      },
      boxShadow: {
        soft: "0 30px 60px rgba(15,23,42,0.08)",
        card: "0 20px 45px rgba(15,23,42,0.07)",
        dropdown: "0 15px 35px rgba(15,23,42,0.12)",
        modal: "0 40px 80px rgba(15,23,42,0.18)",
        toast: "0 20px 35px rgba(15,23,42,0.15)",
      },
      borderRadius: {
        panel: "12px",
        btn: "8px",
        input: "10px",
        badge: "6px",
      },
    },
  },
  plugins: [],
} satisfies Config;
