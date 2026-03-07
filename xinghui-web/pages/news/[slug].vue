<script setup lang="ts">
const route = useRoute();
const { find, getStrapiMedia } = useStrapi();

const slug = route.params.slug as string;

const { data: articleData } = await useAsyncData(`article-${slug}`, () =>
  find('articles', {
    'filters[slug][$eq]': slug,
    populate: ['cover', 'category', 'content'],
    publicationState: 'live',
  })
);

const article = computed(() => articleData.value?.data?.[0]);

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' });
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

useSeo({
  title: article.value?.title || '新闻详情',
  description: article.value?.summary,
  image: article.value?.cover?.url ? getStrapiMedia(article.value.cover.url) : undefined,
});

const { initShare } = useWechat();
onMounted(() => {
  if (article.value) {
    initShare({
      title: article.value.title,
      desc: article.value.summary || '',
      imgUrl: article.value.cover?.url ? getStrapiMedia(article.value.cover.url) : undefined,
    });
  }
});
</script>

<template>
  <article v-if="article" class="pb-16">
    <!-- Hero -->
    <section class="bg-dark py-16">
      <div class="container-page max-w-3xl">
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <NuxtLink to="/news" class="hover:text-white transition-colors">新闻动态</NuxtLink>
          <span>/</span>
          <span v-if="article.category?.name" class="text-primary-300">{{ article.category.name }}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white leading-tight">{{ article.title }}</h1>
        <p class="mt-4 text-gray-400 text-sm">
          发布于 {{ formatDate(article.publishedAt) }}
        </p>
      </div>
    </section>

    <!-- Cover -->
    <div v-if="article.cover?.url" class="container-page max-w-3xl -mt-8">
      <div class="aspect-video rounded-xl overflow-hidden shadow-lg">
        <img
          :src="getStrapiMedia(article.cover.url)"
          :alt="article.title"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- Content (Strapi Blocks) -->
    <div class="container-page max-w-3xl mt-8">
      <div class="prose prose-lg max-w-none">
        <p v-if="article.summary" class="text-lg text-gray-600 font-medium border-l-4 border-primary-500 pl-4 mb-8">
          {{ article.summary }}
        </p>
        <!-- Strapi blocks content rendered as HTML -->
        <div v-if="article.content" v-html="renderBlocks(article.content)" />
      </div>

      <!-- Back -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <NuxtLink to="/news" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
          <- 返回新闻列表
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script lang="ts">
// Simple Strapi blocks renderer
function renderBlocks(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks
    .map((block) => {
      if (block.type === 'paragraph') {
        const text = renderChildren(block.children);
        return `<p>${text}</p>`;
      }
      if (block.type === 'heading') {
        const text = renderChildren(block.children);
        const level = block.level || 2;
        return `<h${level}>${text}</h${level}>`;
      }
      if (block.type === 'list') {
        const tag = block.format === 'ordered' ? 'ol' : 'ul';
        const items = block.children
          .map((item: any) => `<li>${renderChildren(item.children)}</li>`)
          .join('');
        return `<${tag}>${items}</${tag}>`;
      }
      if (block.type === 'image') {
        return `<img src="${block.image?.url || ''}" alt="${block.image?.alternativeText || ''}" />`;
      }
      if (block.type === 'quote') {
        const text = renderChildren(block.children);
        return `<blockquote>${text}</blockquote>`;
      }
      if (block.type === 'code') {
        const text = renderChildren(block.children);
        return `<pre><code>${text}</code></pre>`;
      }
      return '';
    })
    .join('');
}

function renderChildren(children: any[]): string {
  if (!children || !Array.isArray(children)) return '';
  return children
    .map((child) => {
      if (child.type === 'text') {
        let text = child.text || '';
        if (child.bold) text = `<strong>${text}</strong>`;
        if (child.italic) text = `<em>${text}</em>`;
        if (child.underline) text = `<u>${text}</u>`;
        if (child.strikethrough) text = `<s>${text}</s>`;
        if (child.code) text = `<code>${text}</code>`;
        return text;
      }
      if (child.type === 'link') {
        const text = renderChildren(child.children);
        return `<a href="${child.url}" target="_blank" rel="noopener">${text}</a>`;
      }
      return '';
    })
    .join('');
}
</script>
