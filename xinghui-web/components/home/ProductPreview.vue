<script setup lang="ts">
const { getStrapiMedia } = useStrapi();

defineProps<{
  products: any[];
}>();
</script>

<template>
  <section class="py-16 sm:py-20">
    <div class="container-page">
      <h2 class="section-title">产品服务</h2>
      <p class="section-subtitle">为企业提供专业、高效的数据解决方案</p>

      <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="product in products"
          :key="product.id"
          class="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div v-if="product.cover?.url" class="aspect-video overflow-hidden bg-gray-100">
            <img
              :src="getStrapiMedia(product.cover.url)"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="p-5">
            <div v-if="product.icon?.url" class="w-10 h-10 mb-3">
              <img :src="getStrapiMedia(product.icon.url)" :alt="product.name" class="w-full h-full object-contain" />
            </div>
            <h3 class="font-semibold text-dark mb-2">{{ product.name }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ product.summary }}</p>
          </div>
        </div>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/products" class="btn-outline">
          查看全部产品
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
