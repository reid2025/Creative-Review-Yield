// ✅ Updated main content area for independent scrolling – 2025-01-27 (by Cursor AI)
// ✅ Added Toaster component for toast notifications – 2025-01-27 (by Cursor AI)
// ✅ Fixed overflow-hidden to allow zoom overlay to appear above all UI – 2025-01-27 (by Cursor AI)

import type { Metadata } from "next"
import { Geist, Geist_Mono, DM_Sans, League_Spartan } from "next/font/google"
import "./globals.css"
// import { StagewiseToolbar } from "@stagewise/toolbar-next"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"
import { GoogleAuthProvider } from "@/contexts/GoogleAuthContext"
import { CreativeDataProvider } from "@/contexts/CreativeDataContext"
import { LayoutWrapper } from "@/components/LayoutWrapper"
import QueryProvider from "@/providers/query-provider"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})
const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-league-spartan",
})

export const metadata: Metadata = {
  title: "Creative Tracker | TSEG",
  description: "Track and analyze creative performance across ad campaigns with real-time metrics, Google Sheets integration, and comprehensive creative library management.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${leagueSpartan.variable} font-sans antialiased`}>
        <GoogleAuthProvider>
          <QueryProvider>
            <CreativeDataProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </CreativeDataProvider>
          </QueryProvider>
        </GoogleAuthProvider>
        {/* <StagewiseToolbar /> */}
        <Toaster />
        <Sonner />
      </body>
    </html>
  )
}