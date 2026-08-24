"use client"

//เอาทุกอย่างของ react มัดรวมกัน
import * as React from "react"
//เปลี่ยนชื่อ localStorage จำ user preference
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}