import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "A to Z Cleaning Services | Professional Cleaning in Madinaty & El Shorouk",

  description:
    "Professional cleaning services for homes, apartments, villas, cafés, shops, offices, banks, and commercial properties across Madinaty and El Shorouk, Cairo.",

  keywords: [
    "A to Z Cleaning Services",
    "cleaning services Madinaty",
    "cleaning services El Shorouk",
    "professional cleaning Egypt",
    "residential cleaning",
    "commercial cleaning",
    "office cleaning",
    "villa cleaning",
    "apartment cleaning",
  ],

  authors: [
    {
      name: "A to Z Cleaning Services",
    },
  ],

  creator: "A to Z Cleaning Services",

  metadataBase: new URL(
    "https://atozcleaningservices.com"
  ),

  openGraph: {
    title:
      "A to Z Cleaning Services | Professional Cleaning in Madinaty & El Shorouk",

    description:
      "Professional residential, retail, and corporate cleaning services across Madinaty and El Shorouk.",

    type: "website",

    locale: "en_EG",

    siteName: "A to Z Cleaning Services",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "A to Z Cleaning Services | Professional Cleaning",

    description:
      "Professional cleaning services across Madinaty and El Shorouk.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}