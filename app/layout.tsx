import type { Metadata } from "next";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://helleas.no"),
  robots: { index: true, follow: true },
  title: { default: "Helle AS", template: "%s | Helle AS" },
  icons: { icon: "/img/favicon-32x32.png", apple: "/img/apple-touch-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nn" data-concept="signature">
      <body>{children}</body>
    </html>
  );
}
