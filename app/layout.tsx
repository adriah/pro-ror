import type { Metadata } from "next";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://helleas.no"),
  alternates: { canonical: "https://helleas.no/" },
  robots: { index: true, follow: true },
  title: { default: "Helle AS — Tryggleik i vatn. På Bømlo.", template: "%s | Helle AS" },
  description: "Din lokale røyrleggjar på Bømlo. Me hjelper deg med vatn, varme og bad — med meisterkompetanse, omtanke og service 24/7.",
  icons: { icon: "/img/favicon-32x32.png", apple: "/img/apple-touch-icon.png" },
  openGraph: {
    title: "Helle AS — Tryggleik i vatn. På Bømlo.",
    description: "Vatn, varme og bad. Lokalt handverk du kan stola på.",
    locale: "nn_NO",
    type: "website",
    images: ["/img/orig_logo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nn" data-concept="signature">
      <body>{children}</body>
    </html>
  );
}
