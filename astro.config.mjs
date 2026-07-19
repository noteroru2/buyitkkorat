// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const SITE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";

export default defineConfig({
  site: SITE,
  trailingSlash: "never",
  compressHTML: true,
  build: {
    format: "file",
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
