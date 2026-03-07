export const useSeo = (options: { title: string; description?: string; image?: string; url?: string }) => {
  const config = useRuntimeConfig();
  const fullTitle = options.title.includes('薪汇科技') ? options.title : `${options.title} - 薪汇科技`;

  useHead({ title: fullTitle });

  useSeoMeta({
    title: fullTitle,
    ogTitle: fullTitle,
    description: options.description || '薪汇科技 - 专业数据服务商，让数据创造价值',
    ogDescription: options.description || '薪汇科技 - 专业数据服务商，让数据创造价值',
    ogImage: options.image || `${config.public.siteUrl}/og-cover.jpg`,
    ogUrl: options.url || config.public.siteUrl,
    ogType: 'website',
    ogSiteName: '薪汇科技',
    twitterCard: 'summary_large_image',
  });
};
