import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Navbar } from "@/components/ui/Navbar";
import { BottomNav } from "@/components/ui/BottomNav";
import { Footer } from "@/components/ui/Footer";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { siteConfig } from "@/lib/seo";
import { LayoutWrapper } from "@/components/ui/LayoutWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

// ─── Viewport (terpisah dari Metadata di Next.js 14+) ─────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

// ─── Root Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // metadataBase: semua URL relatif (OG, canonical, dll) dihitung dari sini
  metadataBase: new URL(siteConfig.url),

  // ── Title ──
  title: {
    default: `Jual Website Jambi — Jasa Website Dealer, Bimbel, Umroh & UMKM | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },

  // ── Description ──
  description: siteConfig.description,

  // ── Keywords ──
  keywords: siteConfig.keywords,

  // ── Author / Publisher ──
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  generator: "Next.js",
  category: "business",

  // ── Favicon & Icons (Next.js 14 — wajib di sini agar muncul di tab browser) ──
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },

  // ── Canonical & Alternates ──
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
    },
  },

  // ── Open Graph ──
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `Jual Website Jambi — Dealer, Bimbel, Umroh, Konstruksi & UMKM | ${siteConfig.name}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/icon.png`,
        width: 512,
        height: 512,
        alt: `${siteConfig.name} — Jasa Pembuatan Website Profesional di Jambi`,
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X Card ──
  twitter: {
    card: "summary_large_image",
    site: "@lumaspaceWeb",
    creator: "@lumaspaceWeb",
    title: `Jual Website Jambi — Dealer, Bimbel, Umroh & UMKM | ${siteConfig.name}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/icon.png`],
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Google Search Console Verification (dua metode aktif sekaligus) ──
  verification: {
    google: [
      "HKiqei_KN4o0_LJQScy0kbxO1zTsXgwiod8ld9TghZM", // HTML tag method
      "ebb0fcba438bf454",                              // HTML file method
    ],
  },

  // ── Additional meta tags ──
  other: {
    "geo.region": "ID-JA",
    "geo.placename": "Jambi",
    "geo.position": "-1.6101;103.6131",
    ICBM: "-1.6101, 103.6131",
    "format-detection": "telephone=yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": siteConfig.name,
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": "/icon.png",
    "og:locale:alternate": "id_ID",
    "X-Robots-Tag": "index, follow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect ke domain penting untuk performa */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.thum.io" />
        <link rel="preconnect" href="https://iad.microlink.io" />
        {/* Canonical eksplisit */}
        <link rel="canonical" href={siteConfig.url} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-accent-blue/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Global Premium Red Gradient Background Silhouettes & Radial Glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {/* Radial glows / atmospheric lighting */}
              <div className="absolute top-[5%] left-[5%] w-[80vw] h-[80vw] max-w-[800px] rounded-full bg-rose-600/[0.04] blur-[150px] pointer-events-none" />
              <div className="absolute top-[35%] right-[5%] w-[70vw] h-[70vw] max-w-[700px] rounded-full bg-red-500/[0.03] blur-[120px] pointer-events-none" />
              <div className="absolute bottom-[20%] left-[10%] w-[75vw] h-[75vw] max-w-[750px] rounded-full bg-orange-500/[0.02] blur-[140px] pointer-events-none" />

              {/* Large abstract Hexagon silhouette */}
              <svg className="absolute top-[10%] right-[-5%] w-[60vw] h-[60vw] max-w-[650px] text-rose-500/[0.02] transform rotate-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="currentColor" strokeWidth="0.4" />
                <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" stroke="currentColor" strokeWidth="0.15" />
              </svg>

              {/* Concentric circles silhouette */}
              <svg className="absolute bottom-[25%] -left-[10%] w-[70vw] h-[70vw] max-w-[750px] text-rose-400/[0.02]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.3" />
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.15" />
                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.1" />
              </svg>

              {/* Elegant organic wave lines */}
              <svg className="absolute top-[45%] left-[-5%] w-[110vw] h-[30vh] text-rose-500/[0.02]" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0,160 C360,260 720,60 1080,160 C1260,210 1380,110 1440,160" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" />
                <path d="M0,200 C360,300 720,100 1080,200 C1260,250 1380,150 1440,200" stroke="currentColor" strokeWidth="0.2" strokeLinecap="round" />
              </svg>
            </div>

            <LayoutWrapper
              navbar={<Navbar />}
              contactCTA={<ContactCTA />}
              footer={<Footer />}
              bottomNav={<BottomNav />}
              whatsAppFloat={<WhatsAppFloat />}
            >
              {children}
            </LayoutWrapper>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
