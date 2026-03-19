export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  // 组件在子目录（home/、layout/、common/）中，禁用路径前缀
  // 这样 components/home/HeroBanner.vue 直接用 <HeroBanner /> 而非 <HomeHeroBanner />
  components: [
    { path: '~/components', pathPrefix: false },
  ],

  runtimeConfig: {
    public: {
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'theme-color', content: '#0052D9' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { isr: 60 },
    '/products': { isr: 60 },
    '/about': { isr: 3600 },
    '/news': { isr: 60 },
    '/news/**': { isr: 60 },
  },

  nitro: {
    compressPublicAssets: true,
  },

  compatibilityDate: '2025-01-01',
});
