import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FluidCursorTrailWrapper from "./components/common/FluidCursorTrailWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adidev.dev"),
  title: {
    default: "Adidev Anand — Full Stack Developer & AWS Cloud Engineer",
    template: "%s | Adidev Anand",
  },
  description:
    "Final-year Information Security student at VIT Vellore. Full-stack systems, AWS cloud architecture, and production-grade applications. 2x hackathon winner. AWS SAA-C03 certified.",
  keywords: [
    "Adidev Anand",
    "Full Stack Developer",
    "AWS Cloud Engineer",
    "AWS SAA-C03",
    "VIT Vellore",
    "Information Security",
    "Django",
    "FastAPI",
    "React",
    "Next.js",
  ],
  authors: [{ name: "Adidev Anand" }],
  creator: "Adidev Anand",
  publisher: "Adidev Anand",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Adidev Anand — Full Stack Developer & AWS Cloud Engineer",
    description:
      "Final-year Information Security student at VIT Vellore. Full-stack systems, AWS cloud architecture, and production-grade applications.",
    url: "https://adidev.dev",
    siteName: "Adidev Anand Portfolio",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Adidev Anand Portfolio Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adidev Anand — Full Stack Developer & AWS Cloud Engineer",
    description:
      "Full-stack systems, AWS cloud architecture, production-grade applications. 2x hackathon winner. AWS SAA-C03 certified.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] text-[#ededed]`}
      >
        {children}
        <FluidCursorTrailWrapper />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Adidev Anand",
              url: "https://adidev.dev",
              jobTitle: "Full Stack Developer",
              sameAs: [
                "https://github.com/CodinGakpo",
                "https://linkedin.com/in/adidev-anand",
              ],
              description:
                "Final-year Information Security student at VIT Vellore. Full-stack systems, AWS cloud architecture, and production-grade applications.",
            }),
          }}
        />
      </body>
    </html>
  );
}
