import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must reach utility pages to see their noindex directives.
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://helleas.no/sitemap.xml",
  };
}
