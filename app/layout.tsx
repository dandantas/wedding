import type { Metadata } from "next";
import { Baskervville, Luxurious_Script } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const baskervville = Baskervville({
  subsets: ["latin"],
  variable: "--font-baskervville",
  display: "swap",
  weight: ["400"],
});

const luxuriousScript = Luxurious_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-luxurious-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Carolina & Daniel | Casamento",
  description: "Join us in celebrating our love. We can't wait to share this special day with you.",
  keywords: ["wedding", "celebration", "love", "marriage", "save the date"],
  openGraph: {
    title: "Carolina & Daniel | Casamento",
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
        className={`${baskervville.variable} ${luxuriousScript.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
