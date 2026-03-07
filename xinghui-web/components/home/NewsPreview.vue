<script setup lang="ts">
const { getStrapiMedia } = useStrapi();

defineProps<{
  articles: any[];
}>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
</script>

<template>
  <section class="py-16 sm:py-20 bg-gray-50">
    <div class="container-page">
      <h2 class="section-title">新闻动态</h2>
      <p class="section-subtitle">了解薪汇科技最新资讯</p>

      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="article in articles"
          :key="article.id"
          :to="`/news/${article.slug}`"
          class="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div v-if="article.cover?.url" class="aspect-video overflow-hidden bg-gray-100">
            <img
              :src="getStrapiMedia(article.cover.url)"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span v-if="article.category?.name" class="text-primary-500">{{ article.category.name }}</span>
              <span>{{ formatDate(article.publishedAt) }}</span>
            </div>
            <h3 class="font-semibold text-dark mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
              {{ article.title }}
            </h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ article.summary }}</p>
          </div>
        </NuxtLink>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/news" class="btn-outline">
          查看全部新闻
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
