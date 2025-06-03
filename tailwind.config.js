/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // 🎨 Updated Lena Agora Color Palette with Lighter Navy Base (Fixed Black Issue)
        "digital-gold": "#D4AF37",        // Primary Color - Sophisticated metallic gold
        "circuit-bronze": "#B8860B",      // Typography & Borders - Deep bronze hint
        "darkest-navy": "#0C1B2A",        // Background/Base - Lighter Navy (fixed black issue)
        "darker-navy": "#102A43",         // Section Backgrounds - Darker Navy
        "deep-azure": "#143250",          // Card Backgrounds - Deep Azure
        "electric-cyan": "#00FFFF",       // Hover/Interactive Accents - Subtle glowing accent
        "slate-steel": "#334E68",         // Text/Shadows - Muted steel blue
        
        // Bright white colors for text
        "bright-white": "#FFFFFF",        // Bright white for body text
        "off-white": "#F8F9FA",           // Slightly off-white variant
        
        // Legacy compatibility (mapping to correct colors)
        gold: "#D4AF37",                  // Digital Gold
        bronze: "#B8860B",                // Circuit Bronze  
        navy: "#0C1B2A",                  // Lighter Navy (fixed)
        azure: "#143250",                 // Deep Azure
        cyan: "#00FFFF",                  // Electric Cyan
        steel: "#334E68",                 // Slate Steel
        
        // FIXED: Legacy silver mapping - now consistent with CSS
        silver: "#FFFFFF",                // Bright white (consistent with CSS .text-silver)
        
        // Shadcn UI color system (uses CSS variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        goldShimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 8s infinite linear",
        goldShimmer: "goldShimmer 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee var(--duration) infinite linear",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
