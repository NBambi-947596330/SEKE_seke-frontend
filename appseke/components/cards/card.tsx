// src/components/Card.tsx

import { lightTheme } from "@/style"



interface CardProps {
  title: string
  children: React.ReactNode
}

export const Card = ({ title, children }: CardProps) => {
  return (
    <div
      style={{
        backgroundColor: lightTheme.colors.primary,
        padding: lightTheme.spacing.md,
        borderRadius: lightTheme.borderRadius.medium,
        border: `1px solid ${lightTheme.colors.border}`,
        fontFamily: lightTheme.typography.fontFamily,
        width: "300px",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: lightTheme.spacing.sm,
          color: lightTheme.colors.primary,
          fontSize: lightTheme.typography.fontSize.large,
          fontWeight: lightTheme.typography.fontWeight.bold,
        }}
      >
        {title}
      </h3>

      <div
        style={{
          color: lightTheme.colors.text,
          fontSize: lightTheme.typography.fontSize.medium,
        }}
      >
        {children}
      </div>
    </div>
  )
}
