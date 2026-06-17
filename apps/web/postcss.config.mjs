// postcss.config.mjs — pipeline PostCSS per Tailwind v4 in @voltaway/web
// Scopo: attiva @tailwindcss/postcss durante build Next.js.

const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
