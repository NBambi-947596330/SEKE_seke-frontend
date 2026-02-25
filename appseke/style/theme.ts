// src/styles/theme.ts

export interface Theme {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    error: string
    warning: string
  }

  typography: {
    fontFamily: string
    fontSize: {
      small: string
      medium: string
      large: string
      xlarge: string
    }
    fontWeight: {
      regular: number
      medium: number
      bold: number
    }
  }

  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }

  borderRadius: {
    small: string
    medium: string
    large: string
    round: string
  }
}
