// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxt/icon"
  ],
  i18n: {
    vueI18n: './i18n/i18n.config.ts',
    langDir: 'locales/',
    locales: [
      { code: 'vi', file: 'vi.json', name: 'Tiếng Việt' },
      { code: 'en', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'vi'
  },
  routeRules: {
    '/auth/**': { ssr: false }
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000'
    }
  },
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  }
})
