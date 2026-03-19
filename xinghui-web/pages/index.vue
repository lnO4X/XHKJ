<script setup lang="ts">
const { find, getSingle, getStrapiMedia } = useStrapi();

// 安全的 API 请求包装：单个接口失败不影响其他数据
async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn('[API]', e);
    return fallback;
  }
}

const { data: pageData } = await useAsyncData('homepage', async () => {
  const [banners, products, articles, homepage, companyInfo] = await Promise.all([
    safeFetch(() => find('banners', {
      sort: 'sortOrder:asc',
      populate: 'image',
      'pagination[limit]': 5,
    }), { data: [] }),
    safeFetch(() => find('products', {
      sort: 'sortOrder:asc',
      populate: ['icon', 'cover'],
      'pagination[limit]': 4,
    }), { data: [] }),
    safeFetch(() => find('articles', {
      sort: ['isTop:desc', 'publishedAt:desc'],
      populate: ['cover', 'category'],
      'pagination[limit]': 3,
    }), { data: [] }),
    safeFetch(() => getSingle('homepage', { populate: 'stats' }), { data: null }),
    safeFetch(() => getSingle('company-info'), { data: null }),
  ]);
  return { banners, products, articles, homepage, companyInfo };
});

const homepage = computed(() => pageData.value?.homepage?.data);
const banners = computed(() => pageData.value?.banners?.data || []);
const products = computed(() => pageData.value?.products?.data || []);
const articles = computed(() => pageData.value?.articles?.data || []);

useSeo({
  title: homepage.value?.seoTitle || '薪汇科技 - 让数据创造价值',
  description: homepage.value?.seoDescription || '专业数据服务商，提供数据采集、清洗、分析等一站式解决方案',
});

const { initShare } = useWechat();
onMounted(() => {
  initShare({
    title: '薪汇科技 - 让数据创造价值',
    desc: '专业数据服务商',
  });
});
</script>

<template>
  <div>
    <HeroBanner
      :title="homepage?.heroTitle || '让数据创造价值'"
      :subtitle="homepage?.heroSubtitle || '专业数据服务商'"
      :banners="banners"
    />

    <StatsCounter :stats="homepage?.stats || []" />

    <CoreAbility />

    <ProductPreview :products="products" />

    <NewsPreview :articles="articles" />
  </div>
</template>
