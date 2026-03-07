<script setup lang="ts">
const { getStrapiMedia } = useStrapi();

const props = defineProps<{
  title: string;
  subtitle: string;
  banners: any[];
}>();

const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  if (props.banners.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.banners.length;
    }, 5000);
  }
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <section class="relative bg-dark overflow-hidden">
    <!-- Banner Images -->
    <div class="relative h-[60vh] min-h-[400px] max-h-[600px]">
      <template v-if="banners.length > 0">
        <div
          v-for="(banner, index) in banners"
          :key="banner.id"
          class="absolute inset-0 transition-opacity duration-700"
          :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"
        >
          <img
            :src="getStrapiMedia(banner.image?.url)"
            :alt="banner.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-dark/60" />
        </div>
      </template>
      <div v-else class="absolute inset-0 bg-gradient-to-br from-dark to-dark-lighter" />

      <!-- Text Overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center px-4">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {{ title }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 mb-8">
            {{ subtitle }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/products" class="btn-primary">
              了解产品
            </NuxtLink>
            <NuxtLink to="/contact" class="btn-outline !border-white !text-white hover:!bg-white/10">
              联系我们
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Dots Indicator -->
      <div v-if="banners.length > 1" class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          v-for="(_, index) in banners"
          :key="index"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="index === currentIndex ? 'bg-white w-6' : 'bg-white/50'"
          @click="currentIndex = index"
        />
      </div>
    </div>
  </section>
</template>
