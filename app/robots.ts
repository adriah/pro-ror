import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/takk", "/takk.html", "/__forms", "/__forms.html"] },
    sitemap: "https://helleas.no/sitemap.xml",
  };
}
