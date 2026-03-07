import Redis from 'ioredis';

export default {
  register({ strapi }) {
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    const redisPassword = process.env.REDIS_PASSWORD || undefined;

    const redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      strapi.log.info('Redis connected');
    });

    redis.on('error', (err) => {
      strapi.log.error('Redis error:', err.message);
    });

    // Attach to strapi instance for use in services
    (strapi as any).redis = redis;
  },

  async bootstrap({ strapi }) {
    strapi.log.info('Xinghui CMS bootstrapped');

    try {
      // Seed categories
      const categoryCount = await strapi.query('api::category.category').count();
      if (categoryCount === 0) {
        const categories = [
          { name: '公司新闻', slug: 'company-news' },
          { name: '行业资讯', slug: 'industry-news' },
          { name: '公告通知', slug: 'announcements' },
        ];
        for (const cat of categories) {
          await strapi.query('api::category.category').create({ data: cat });
        }
        strapi.log.info('Seeded initial categories');
      }

      // Seed company info (single type)
      const companyInfo = await strapi.query('api::company-info.company-info').findMany();
      if (!companyInfo || companyInfo.length === 0) {
        await strapi.query('api::company-info.company-info').create({
          data: {
            name: '薪汇科技',
            slogan: '让数据创造价值',
            address: '深圳市',
            email: 'contact@minxinhui.com',
          },
        });
        strapi.log.info('Seeded company info');
      }

      // Seed homepage (single type)
      const homepage = await strapi.query('api::homepage.homepage').findMany();
      if (!homepage || homepage.length === 0) {
        await strapi.query('api::homepage.homepage').create({
          data: {
            heroTitle: '让数据创造价值',
            heroSubtitle: '专业数据服务商',
            seoTitle: '薪汇科技 - 让数据创造价值',
            seoDescription: '薪汇科技是专业的数据服务商，提供数据采集、清洗、分析等一站式数据解决方案。',
          },
        });
        strapi.log.info('Seeded homepage');
      }
    } catch (err) {
      strapi.log.error('Bootstrap error:', err);
    }
  },

  destroy({ strapi }) {
    const redis = (strapi as any).redis;
    if (redis) {
      redis.disconnect();
      strapi.log.info('Redis disconnected');
    }
  },
};
