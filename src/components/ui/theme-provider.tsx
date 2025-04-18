
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Manually define the props type since it's not exported directly
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
