import type { Metadata, Viewport } from "next"
import { Fraunces, Manrope } from "next/font/google"

import { Providers } from "@/providers"
import { siteConfig } from "@/config/site"
import "./globals.css"

/* ────────────────────────────────────────────────────────────
   FONTS
   Both are variable fonts — no explicit weight array needed.
   CSS variable names are applied to <html> and referenced
   in globals.css via @theme inline { --font-serif: var(--font-fraunces) }
──────────────────────────────────────────────────────────── */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

/* ────────────────────────────────────────────────────────────
   ROOT METADATA
   Page-level metadata is composed via lib/metadata.ts.
   This sets the site-wide defaults and title template.
──────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  metadataBase: new URL(siteConfig.url),
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og/default.png`,
        width: siteConfig.og.width,
        height: siteConfig.og.height,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og/default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
}

/* ────────────────────────────────────────────────────────────
   VIEWPORT
   Exported separately per Next.js 15+ requirement.
   themeColor updates the browser chrome on mobile.
──────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(36 22% 97%)" },
    { media: "(prefers-color-scheme: dark)",  color: "hsl(25 14% 7%)"  },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

/* ────────────────────────────────────────────────────────────
   ROOT LAYOUT
──────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
