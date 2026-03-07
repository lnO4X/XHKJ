<script setup lang="ts">
const { getSingle, getStrapiMedia } = useStrapi();

const { data: companyData } = await useAsyncData('about-company', () =>
  getSingle('company-info', { populate: 'wechatQr' })
);

const company = computed(() => companyData.value?.data);

useSeo({
  title: '关于我们',
  description: '了解薪汇科技 - 专业数据服务商，让数据创造价值',
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <section class="bg-dark py-16 sm:py-20">
      <div class="container-page text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-white">关于我们</h1>
        <p class="mt-4 text-gray-300">{{ company?.slogan || '让数据创造价值' }}</p>
      </div>
    </section>

    <!-- About Content -->
    <section class="py-16">
      <div class="container-page max-w-3xl">
        <h2 class="text-2xl font-bold text-dark mb-6">{{ company?.name || '薪汇科技' }}</h2>

        <!-- Strapi blocks about content -->
        <div v-if="company?.about" class="prose prose-lg max-w-none text-gray-600">
          <div v-html="renderAboutBlocks(company.about)" />
        </div>
        <div v-else class="text-gray-600 leading-relaxed space-y-4">
          <p>
            薪汇科技是一家专注于数据服务的科技公司，隶属于深圳市民信惠集团。
            我们致力于为企业提供专业的数据采集、清洗、分析和应用解决方案，
            帮助客户充分挖掘数据价值，实现业务增长。
          </p>
          <p>
            凭借深厚的技术积累和丰富的行业经验，我们已服务众多企业客户，
            涵盖金融、电商、教育等多个领域。
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Info -->
    <section class="py-16 bg-gray-50">
      <div class="container-page max-w-3xl">
        <h2 class="text-2xl font-bold text-dark mb-8">联系信息</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-if="company?.address" class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h4 class="font-medium text-dark">地址</h4>
              <p class="text-sm text-gray-500">{{ company.address }}</p>
            </div>
          </div>
          <div v-if="company?.phone" class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <h4 class="font-medium text-dark">电话</h4>
              <p class="text-sm text-gray-500">{{ company.phone }}</p>
            </div>
          </div>
          <div v-if="company?.email" class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h4 class="font-medium text-dark">邮箱</h4>
              <p class="text-sm text-gray-500">{{ company.email }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
function renderAboutBlocks(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map((block: any) => {
      if (block.type === 'paragraph') {
        const text = (block.children || [])
          .map((c: any) => c.text || '')
          .join('');
        return `<p>${text}</p>`;
      }
      return '';
    })
    .join('');
}
</script>
