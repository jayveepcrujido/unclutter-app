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
        background: "#F9FAFB",
        surface: "#FFFFFF",
        "surface-hover": "#F3F4F6",
        "surface-selected": "#EEF2FF",
        border: "#E2E8F0", // All borders use this light color
        "border-sidebar": "#E2E8F0",
        "border-focus": "#6366F1",
        primary: {
          DEFAULT: "#6366F1",
          light: "#EEF2FF",
          hover: "#4F46E5",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
      },
      boxShadow: {
        soft: "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        card: "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        dropdown: "0 4px 16px rgba(0,0,0,0.10)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
        toast: "0 4px 12px rgba(0,0,0,0.10)",
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
