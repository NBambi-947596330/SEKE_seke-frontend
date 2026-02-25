// src/styles/light.ts

import { Theme } from "./theme"

export const lightTheme: Theme = {
  colors: {
    primary: "#18B481",
    secondary: "#9333EA",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#ECEFF3",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B"
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: {
      small: "12px",
      medium: "14px",
      large: "18px",
      xlarge: "24px"
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700
    }
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  },

  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "16px",
    round: "9999px"
  }
}

export default lightTheme