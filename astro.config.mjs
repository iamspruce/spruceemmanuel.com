import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";

import icon from "astro-icon";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // Replace with your actual domain
  site: "https://www.spruceemmanuel.com",

  integrations: [icon(), mdx()],
});
