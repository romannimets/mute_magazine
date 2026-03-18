import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Rimosso Geist (non funziona su Next.js 13)
// Usato solo il font locale
const mattone = localFont({
  src: "../../public/Mattone-150.otf",
  variable: "--font-mattone",
  display: "swap",
});

const systemFont = localFont({
  src: [
    {
      path: "../../public/Mattone-150.otf",
      weight: "400",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Mute Magazine",
  description: "Art & Culture Magazine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${mattone.variable} ${systemFont.variable}`}>
        <ScrollToTop />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}