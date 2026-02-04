import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const billaMount = localFont({
  src: "../public/BillaMount-Regular.ttf",
  variable: "--font-billa-mount",
  display: "swap",
});

const engraversGothic = localFont({
  src: "../public/engravers-gothic-bt.ttf",
  variable: "--font-engravers-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carolina & Daniel | Wedding",
  description: "Join us in celebrating our love. We can't wait to share this special day with you.",
  keywords: ["wedding", "celebration", "love", "marriage", "save the date"],
  openGraph: {
    title: "Carolina & Daniel | Wedding",
    description: "Join us in celebrating our love. We can't wait to share this special day with you.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${cormorant.variable} ${billaMount.variable} ${engraversGothic.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
