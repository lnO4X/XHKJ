import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '~': '/sessions/exciting-wizardly-hypatia/mnt/mainsite/xinghui-web',
      '#app': '/sessions/exciting-wizardly-hypatia/mnt/mainsite/xinghui-web/.nuxt',
    },
  },
});
