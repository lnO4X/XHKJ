<script setup lang="ts">
const { find, getStrapiMedia } = useStrapi();
const route = useRoute();

const currentPage = computed(() => Number(route.query.page) || 1);
const pageSize = 9;
const currentCategory = computed(() => (route.query.category as string) || '');

const { data: categoriesData } = await useAsyncData('categories', () =>
  find('categories', { sort: 'name:asc' })
);

const { data: articlesData } = await useAsyncData(
  () => `articles-${currentCategory.value}-${currentPage.value}`,
  () => {
    const params: Record<string, any> = {
      sort: ['isTop:desc', 'publishedAt:desc'],
      populate: ['cover', 'category'],
      'pagination[page]': currentPage.value,
      'pagination[pageSize]': pageSize,
      publicationState: 'live',
    };
    if (currentCategory.value) {
      params['filters[category][slug][$eq]'] = currentCategory.value;
    }
    return find('articles', params);
  },
  { watch: [currentPage, currentCategory] }
);

const categories = computed(() => categoriesData.value?.data || []);
const articles = computed(() => articlesData.value?.data || []);
const pagination = computed(() => articlesData.value?.meta?.pagination || { page: 1, pageCount: 1 });

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

useSeo({
  title: '新闻动态',
  description: '薪汇科技新闻动态 - 了解公司最新资讯和行业动态',
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <section class="bg-dark py-16 sm:py-20">
      <div class="container-page text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-white">新闻动态</h1>
        <p class="mt-4 text-gray-300">了解薪汇科技最新资讯</p>
      </div>
    </section>

    <!-- Category Filter -->
    <section class="border-b border-gray-100">
      <div class="container-page py-4 flex gap-4 overflow-x-auto">
        <NuxtLink
          :to="{ path: '/news' }"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="!currentCategory ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          全部
        </NuxtLink>
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="{ path: '/news', query: { category: cat.slug } }"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="currentCategory === cat.slug ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
    </section>

    <!-- Articles Grid -->
    <section class="py-12">
      <div class="container-page">
        <div v-if="articles.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="article in articles"
            :key="article.id"
            :to="`/news/${article.slug}`"
            class="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
                <span v-if="article.isTop" class="px-2 py-0.5 bg-red-50 text-red-500 rounded">置顶</span>
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

        <div v-else class="text-center py-20 text-gray-400">
          暂无文章
        </div>

        <!-- Pagination -->
        <CommonPagination
          v-if="pagination.pageCount > 1"
          :current="pagination.page"
          :total="pagination.pageCount"
          class="mt-10"
        />
      </div>
    </section>
  </div>
</template>
