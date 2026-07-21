// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Prettier (+ prettier-plugin-tailwindcss) owns all formatting. `stylistic`
  // is already off in nuxt.config, but eslint-plugin-vue ships its own
  // template-formatting rules that Prettier also governs. `vue/html-self-closing`
  // is the live conflict: Prettier self-closes void elements (`<img />`), this
  // rule forbids it — so we defer to Prettier and switch it off. If more
  // Prettier/vue conflicts surface later, reach for eslint-config-prettier
  // rather than disabling rules one by one.
  {
    rules: {
      "vue/html-self-closing": "off",
    },
  },
);
