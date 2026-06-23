tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-surface-variant": "#434655", 
        "secondary-fixed": "#dce1ff", 
        "on-primary-fixed-variant": "#0039b4",
        surface: "#fbf8ff", 
        outline: "#747686", 
        tertiary: "#8c3200", 
        "surface-container": "#eeedf8",
        "surface-tint": "#2051da", 
        "secondary-fixed-dim": "#b7c4ff", 
        "primary-fixed": "#dce1ff",
        "surface-bright": "#fbf8ff", 
        "inverse-surface": "#2f3038", 
        "inverse-primary": "#b7c4ff",
        background: "#fbf8ff", 
        "on-error": "#ffffff", 
        "on-secondary-container": "#3d4c83",
        error: "#ba1a1a", 
        "surface-container-lowest": "#ffffff", 
        "surface-container-high": "#e8e7f2",
        "inverse-on-surface": "#f1effb", 
        "on-primary-container": "#e2e5ff", 
        "on-error-container": "#93000a",
        "surface-variant": "#e3e1ed", 
        "on-tertiary": "#ffffff", 
        "on-tertiary-fixed-variant": "#7e2c00",
        "on-primary": "#ffffff", 
        primary: "#0040c7", 
        "on-secondary-fixed-variant": "#35437a",
        "surface-container-low": "#f4f2fe", 
        "surface-container-highest": "#e3e1ed",
        "on-secondary-fixed": "#04164d", 
        "error-container": "#ffdad6", 
        "on-tertiary-fixed": "#370f00",
        "on-tertiary-container": "#ffe0d5", 
        "secondary-container": "#b0befd", 
        "on-secondary": "#ffffff",
        "surface-dim": "#dad9e4", 
        "primary-container": "#2d5be3", 
        "primary-fixed-dim": "#b7c4ff",
        "outline-variant": "#c4c5d7", 
        "on-surface": "#1a1b23", 
        "tertiary-fixed": "#ffdbce",
        secondary: "#4d5b94", 
        "tertiary-container": "#b44200", 
        "tertiary-fixed-dim": "#ffb598",
        "on-background": "#1a1b23", 
        "on-primary-fixed": "#001551",
        "brand-navy": "#121C28",
        "accent": "#0D9488"
      },
      borderRadius: { DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
      spacing: {
        "container-max": "100%", "margin-mobile": "20px", gutter: "24px",
        "section-gap": "80px", "margin-desktop": "40px", unit: "4px"
      },
      fontFamily: {
        "headline-md": ["Montserrat"], "headline-lg": ["Montserrat"], "headline-xl": ["Montserrat"],
        "body-lg": ["Inter"], "body-md": ["Inter"], "display-lg-mobile": ["Montserrat"],
        "label-md": ["Inter"], "display-lg": ["Montserrat"], caption: ["Inter"]
      },
      fontSize: {
        "headline-md": ["clamp(18px, 1.5vw, 24px)", { lineHeight: "1.4", fontWeight: "700" }],
        "headline-lg": ["clamp(24px, 2vw, 32px)",   { lineHeight: "1.3", fontWeight: "700" }],
        "headline-xl": ["clamp(32px, 3vw, 48px)",   { lineHeight: "1.2", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "display-lg-mobile": ["clamp(32px, 3.5vw, 40px)", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "800" }],
        "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
        "display-lg": ["clamp(40px, 4vw, 64px)", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }]
      }
    }
  }
};
