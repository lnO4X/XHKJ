<script setup lang="ts">
const isMenuOpen = ref(false);
const route = useRoute();

const navItems = [
  { label: '首页', path: '/' },
  { label: '产品服务', path: '/products' },
  { label: '新闻动态', path: '/news' },
  { label: '关于我们', path: '/about' },
  { label: '联系我们', path: '/contact' },
];

// Close menu on route change
watch(() => route.path, () => {
  isMenuOpen.value = false;
});
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
    <div class="container-page">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-xl font-bold text-primary-500">薪汇科技</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-sm font-medium transition-colors duration-200"
            :class="route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path))
              ? 'text-primary-500'
              : 'text-gray-600 hover:text-primary-500'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden p-2 -mr-2 text-gray-600"
          aria-label="菜单"
          @click="isMenuOpen = !isMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!isMenuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <nav v-if="isMenuOpen" class="md:hidden pb-4 border-t border-gray-100 mt-2 pt-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="block py-3 px-2 text-base font-medium rounded-lg transition-colors duration-200"
            :class="route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path))
              ? 'text-primary-500 bg-primary-50'
              : 'text-gray-600 hover:bg-gray-50'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </Transition>
    </div>
  </header>
</template>
