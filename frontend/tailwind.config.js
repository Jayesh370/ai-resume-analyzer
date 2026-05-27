/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",   // toggled by adding/removing 'dark' on <html>
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'DM Sans'",       "sans-serif"],
        display: ["'Syne'",          "sans-serif"],
        mono:    ["'JetBrains Mono'","monospace"],
      },
      colors: {
        // Primary violet-indigo brand
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Indigo accent
        accent: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        // Dark surface tokens
        dark: {
          50:  "#f0f0ff",
          900: "#09090f",
          800: "#0f0f1a",
          750: "#13131f",
          700: "#17172a",
          600: "#1e1e35",
          500: "#252542",
          400: "#2e2e50",
          300: "#3d3d6b",
          200: "#5a5a8a",
          100: "#8888bb",
        },
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
        "gradient-subtle": "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.15) 100%)",
        "gradient-glass":  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "gradient-score-excellent": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-score-good":      "linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)",
        "gradient-score-average":   "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-score-poor":      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      },
      boxShadow: {
        "glass":    "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-lg": "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "glow":     "0 0 40px rgba(124,58,237,0.35)",
        "glow-sm":  "0 0 20px rgba(124,58,237,0.25)",
        "card-light":"0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in":       "fadeIn 0.5s ease forwards",
        "slide-up":      "slideUp 0.5s ease forwards",
        "slide-in-right":"slideInRight 0.4s ease forwards",
        "pulse-slow":    "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":     "spin 3s linear infinite",
        "float":         "float 6s ease-in-out infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "score-fill":    "scoreFill 1.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { from:{opacity:0},              to:{opacity:1} },
        slideUp:      { from:{opacity:0,transform:"translateY(20px)"}, to:{opacity:1,transform:"translateY(0)"} },
        slideInRight: { from:{opacity:0,transform:"translateX(20px)"}, to:{opacity:1,transform:"translateX(0)"} },
        float:        { "0%,100%":{transform:"translateY(0)"}, "50%":{transform:"translateY(-8px)"} },
        shimmer:      { "0%":{backgroundPosition:"-200% 0"}, "100%":{backgroundPosition:"200% 0"} },
        scoreFill:    { from:{strokeDashoffset:"var(--dash-total)"}, to:{strokeDashoffset:"var(--dash-offset)"} },
        bounceSubtle: { "0%,100%":{transform:"translateY(0)"}, "50%":{transform:"translateY(-4px)"} },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};