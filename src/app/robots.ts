import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Unlisted, not secret — but there is no reason to index a login form.
      disallow: ["/dashboard"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
