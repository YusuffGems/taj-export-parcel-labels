import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { AppShell } from "@/components/layout/app-shell";
import { THEME_KEY } from "@/constants/business";

export const metadata: Metadata = {
  title: { default: "TAJ EXPORT", template: "%s · TAJ EXPORT" },
  description: "Wholesale customer management and parcel address printing for TAJ EXPORT.",
  applicationName: "TAJ EXPORT",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "TAJ EXPORT", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b2447",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
