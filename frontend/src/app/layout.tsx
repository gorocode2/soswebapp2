import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAStatus from "@/components/PWAStatus";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School of Sharks - AI Cycling Training Platform",
  description:
    "High-tech AI cycling training platform. Unleash your inner predator with personalized workouts, real-time analytics, and adaptive coaching.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SOS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/soslogobig.png", sizes: "192x192", type: "image/png" },
      { url: "/images/soslogobig.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/images/soslogobig.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SOS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/images/soslogobig.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/soslogobig.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/soslogobig.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
        <PWAInstallPrompt />
        <PWAStatus />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
