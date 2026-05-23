/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bccfff",
          300: "#8eafff",
          400: "#5e87ff",
          500: "#3b66f5",
          600: "#2a4be0",
          700: "#233dbb",
          800: "#1f3596",
          900: "#1d3079",
        },
        accent: {
          50: "#f5f0ff",
          100: "#ece0ff",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        ink: {
          50: "#f7f8fb",
          100: "#eef0f6",
          200: "#dfe3ed",
          500: "#6b7280",
          700: "#374151",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)",
        card: "0 4px 14px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.05)",
        pop: "0 18px 40px -16px rgba(15, 23, 42, 0.18), 0 8px 16px -8px rgba(15, 23, 42, 0.1)",
        glow: "0 10px 30px -10px rgba(42, 75, 224, 0.55)",
        ring: "inset 0 0 0 1px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(1200px 600px at 50% -10%, rgba(124, 58, 237, 0.18), transparent 60%), radial-gradient(800px 500px at 90% 10%, rgba(42, 75, 224, 0.18), transparent 60%)",
        "brand-gradient":
          "linear-gradient(135deg, #2a4be0 0%, #7c3aed 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
