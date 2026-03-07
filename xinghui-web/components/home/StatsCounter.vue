<script setup lang="ts">
defineProps<{
  stats: Array<{ number: string; label: string }>;
}>();
</script>

<template>
  <section v-if="stats.length > 0" class="py-12 bg-primary-500">
    <div class="container-page">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
        <div v-for="(stat, index) in stats" :key="index" class="px-4">
          <div class="text-3xl sm:text-4xl font-bold mb-1">{{ stat.number }}</div>
          <div class="text-sm sm:text-base text-primary-100">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
