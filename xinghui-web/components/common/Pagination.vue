<script setup lang="ts">
const props = defineProps<{
  current: number;
  total: number;
}>();

const route = useRoute();
const router = useRouter();

function goToPage(page: number) {
  if (page < 1 || page > props.total || page === props.current) return;
  router.push({ query: { ...route.query, page: page.toString() } });
}

const pages = computed(() => {
  const items: (number | '...')[] = [];
  const { current, total } = props;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
  } else {
    items.push(1);
    if (current > 3) items.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      items.push(i);
    }
    if (current < total - 2) items.push('...');
    items.push(total);
  }
  return items;
});
</script>

<template>
  <nav class="flex justify-center items-center gap-2">
    <button
      class="px-3 py-2 text-sm rounded-lg transition-colors"
      :class="current > 1 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'"
      :disabled="current <= 1"
      @click="goToPage(current - 1)"
    >
      上一页
    </button>

    <template v-for="(page, index) in pages" :key="index">
      <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
      <button
        v-else
        class="w-10 h-10 text-sm rounded-lg transition-colors"
        :class="page === current ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="px-3 py-2 text-sm rounded-lg transition-colors"
      :class="current < total ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'"
      :disabled="current >= total"
      @click="goToPage(current + 1)"
    >
      下一页
    </button>
  </nav>
</template>
