import type { Metadata } from "next";
import { HomePage } from "@/components/site";

const title = "Røyrleggjar på Bømlo – bad, vatn og varme | Helle AS";
const description = "Helle AS er din lokale røyrleggjar på Bømlo. Me hjelper med bad, vassinstallasjonar, varmepumper og golvvarme. Meisterkompetanse og personleg oppfølging.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Helle AS",
    locale: "nn_NO",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

// Only publish business details already stated on the page.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Plumber",
      "@id": "https://helleas.no/#business",
      name: "Helle AS",
      url: "https://helleas.no/",
      description,
      logo: "https://helleas.no/img/orig_logo.png",
      image: "https://helleas.no/img/portfolio/5.jpg",
      telephone: "+4740403681",
      email: "post@helleas.no",
      address: { "@type": "PostalAddress", addressLocality: "Bremnes, Bømlo", addressCountry: "NO" },
      areaServed: { "@type": "AdministrativeArea", name: "Bømlo" },
      sameAs: ["https://www.facebook.com/prororbomlo"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+4740403681",
        contactType: "customer service",
        availableLanguage: ["Norwegian"],
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Røyrleggjartenester på Bømlo",
        itemListElement: ["Bad & velvære", "Kjøkken & vatn", "Varme & inneklima", "Nybygg & oppussing"].map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name, provider: { "@id": "https://helleas.no/#business" } },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://helleas.no/#website",
      name: "Helle AS",
      url: "https://helleas.no/",
      inLanguage: "nn-NO",
      publisher: { "@id": "https://helleas.no/#business" },
    },
  ],
};

export default function Page() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <HomePage />
  </>;
}
