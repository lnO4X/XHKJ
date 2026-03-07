<script setup lang="ts">
const { getSingle, getStrapiMedia } = useStrapi();

const { data: companyInfo } = await useAsyncData('company-info-footer', () =>
  getSingle('company-info', { populate: 'wechatQr' })
);

const info = computed(() => companyInfo.value?.data);
</script>

<template>
  <footer class="bg-dark text-gray-300">
    <div class="container-page py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Company -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">{{ info?.name || '薪汇科技' }}</h3>
          <p class="text-sm leading-relaxed text-gray-400">
            {{ info?.slogan || '让数据创造价值' }}
          </p>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">联系方式</h3>
          <ul class="space-y-2 text-sm text-gray-400">
            <li v-if="info?.address">地址：{{ info.address }}</li>
            <li v-if="info?.phone">电话：{{ info.phone }}</li>
            <li v-if="info?.email">邮箱：{{ info.email }}</li>
          </ul>
        </div>

        <!-- WeChat QR -->
        <div>
          <h3 class="text-white text-lg font-bold mb-4">关注我们</h3>
          <div v-if="info?.wechatQr?.url" class="w-28 h-28 bg-white rounded-lg p-1">
            <img
              :src="getStrapiMedia(info.wechatQr.url)"
              alt="微信公众号"
              class="w-full h-full object-contain"
            />
          </div>
          <p class="text-sm text-gray-400 mt-2">扫码关注微信公众号</p>
        </div>
      </div>

      <!-- Bottom -->
      <div class="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
        <p>© {{ new Date().getFullYear() }} {{ info?.name || '薪汇科技' }}. All rights reserved.</p>
        <p v-if="info?.icpNumber" class="mt-1">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" class="hover:text-gray-400">
            {{ info.icpNumber }}
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>
