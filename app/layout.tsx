import Head from 'next/head';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Roast My Build",
  description: "Roast my Weekly Base-Builds on Rounds",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta
          name="twitter:card"
          content="https://res.cloudinary.com/dbuaprzc0/image/upload/v1733678379/chbafxasgalbavzwsduo.pnge"
        />
        <meta name="twitter:site" content="https://roastmybuild.vercel.app" />
        <meta name="twitter:creator" content="TheCyberverse1" />
        <meta name="twitter:title" content="Roast My Build" />
        <meta name="twitter:description" content="Roast my Weekly Base-Builds on Rounds" />
        <meta
          name="twitter:image"
          content="https://example.com/image.jpghttps://res.cloudinary.com/dbuaprzc0/image/upload/v1733678379/chbafxasgalbavzwsduo.png"
        />
      </Head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
      <Analytics />
    </html>
  );
}
