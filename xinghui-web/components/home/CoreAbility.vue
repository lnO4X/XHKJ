<script setup lang="ts">
const abilities = [
  {
    title: '数据采集',
    desc: '多源异构数据实时采集，支持结构化与非结构化数据',
    icon: '📊',
  },
  {
    title: '数据清洗',
    desc: '智能数据清洗与标准化，确保数据质量与一致性',
    icon: '🔧',
  },
  {
    title: '数据分析',
    desc: '专业数据分析与建模，挖掘数据背后的商业价值',
    icon: '📈',
  },
  {
    title: '数据安全',
    desc: '全链路数据加密与脱敏，保障数据安全合规',
    icon: '🔒',
  },
];
</script>

<template>
  <section class="py-16 sm:py-20 bg-gray-50">
    <div class="container-page">
      <h2 class="section-title">核心能力</h2>
      <p class="section-subtitle">全链路数据服务，助力企业数字化转型</p>

      <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(item, index) in abilities"
          :key="index"
          class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
        >
          <div class="text-4xl mb-4">{{ item.icon }}</div>
          <h3 class="text-lg font-semibold text-dark mb-2">{{ item.title }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
