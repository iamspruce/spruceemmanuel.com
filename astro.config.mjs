import { defineConfig } from "astro/config";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  // Replace with your actual domain
  site: "https://www.spruceemmanuel.com",

  integrations: [icon()],
});
