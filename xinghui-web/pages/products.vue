<script setup lang="ts">
const { find, getStrapiMedia } = useStrapi();

const { data: productsData } = await useAsyncData('products', () =>
  find('products', {
    sort: 'sortOrder:asc',
    populate: ['icon', 'cover', 'features'],
    publicationState: 'live',
  })
);

const products = computed(() => productsData.value?.data || []);

useSeo({
  title: '产品服务',
  description: '薪汇科技产品服务 - 数据采集、清洗、分析等一站式数据解决方案',
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <section class="bg-dark py-16 sm:py-20">
      <div class="container-page text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-white">产品服务</h1>
        <p class="mt-4 text-gray-300">为企业提供专业、高效的数据解决方案</p>
      </div>
    </section>

    <!-- Products List -->
    <section class="py-16">
      <div class="container-page">
        <div class="space-y-16">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            class="flex flex-col lg:flex-row gap-8 items-center"
            :class="index % 2 === 1 ? 'lg:flex-row-reverse' : ''"
          >
            <!-- Image -->
            <div class="w-full lg:w-1/2">
              <div v-if="product.cover?.url" class="aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img
                  :src="getStrapiMedia(product.cover.url)"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="aspect-video rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                <img v-if="product.icon?.url" :src="getStrapiMedia(product.icon.url)" :alt="product.name" class="w-20 h-20 object-contain" />
              </div>
            </div>

            <!-- Content -->
            <div class="w-full lg:w-1/2">
              <h2 class="text-2xl font-bold text-dark mb-3">{{ product.name }}</h2>
              <p class="text-gray-600 mb-6 leading-relaxed">{{ product.summary }}</p>

              <!-- Features -->
              <div v-if="product.features?.length" class="space-y-3">
                <div
                  v-for="(feature, fi) in product.features"
                  :key="fi"
                  class="flex items-start gap-3"
                >
                  <div class="w-6 h-6 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">{{ feature.title }}</h4>
                    <p class="text-sm text-gray-500">{{ feature.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
