import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "./components/GoogleAnalytics";

const mattone = localFont({
  src: "../../public/Mattone-150.otf",
  variable: "--font-mattone",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Mute Rivista",
  description: "Art & Culture Magazine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={mattone.variable}>
        <GoogleAnalytics />
        <ScrollToTop />
        <Navbar />
        {children}
        <Footer />
        <SpeedInsights />  {/* VERCEL INSIGHTS */}
      </body>
    </html>
  );
}