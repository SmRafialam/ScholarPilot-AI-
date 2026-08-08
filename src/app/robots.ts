import type { MetadataRoute } from "next";

const SITE = "https://scholar-pilot-ai-flame.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, auth-gated app routes — no SEO value, keep them out of the index.
        disallow: [
          "/dashboard",
          "/profile",
          "/matches",
          "/explore",
          "/assistant",
          "/documents",
          "/emails",
          "/tracker",
          "/notifications",
          "/billing",
          "/universities/",
          "/scholarships/",
          "/professors/",
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
