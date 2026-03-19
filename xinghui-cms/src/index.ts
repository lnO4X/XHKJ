import crypto from 'crypto';

/**
 * MemoryStore: Redis-compatible in-memory fallback for local development.
 * Supports get/set/del/exists with TTL — no external service needed.
 */
class MemoryStore {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ex?: string, ttl?: number): Promise<void> {
    const expiresAt = ex === 'EX' && ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<number> {
    const val = await this.get(key);
    return val !== null ? 1 : 0;
  }

  disconnect() {
    this.store.clear();
  }
}

/**
 * Email-auth service: 6-digit verification code via Redis + nodemailer
 */
async function emailAuthSendCode(strapi: any, email: string) {
  const redis = strapi.redis;
  if (!redis) throw new Error('Redis not available');

  const rateLimitKey = `rate_limit:send_code:${email}`;
  const exists = await redis.exists(rateLimitKey);
  if (exists) {
    const err: any = new Error('请60秒后再试');
    err.status = 429;
    throw err;
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const codeKey = `email_code:${email}`;
  await redis.set(codeKey, code, 'EX', 300);
  await redis.set(rateLimitKey, '1', 'EX', 60);

  await strapi.plugins['email'].services.email.send({
    to: email,
    subject: '薪汇科技 CMS - 登录验证码',
    text: `您的验证码是：${code}，有效期5分钟。`,
    html: `<p>您的验证码是：<strong>${code}</strong></p><p>有效期5分钟，请勿泄露给他人。</p>`,
  });

  return true;
}

async function emailAuthLogin(strapi: any, email: string, code: string) {
  const redis = strapi.redis;
  if (!redis) throw new Error('Redis not available');

  const codeKey = `email_code:${email}`;
  const storedCode = await redis.get(codeKey);

  if (!storedCode || storedCode !== code) {
    const err: any = new Error('验证码错误或已过期');
    err.status = 401;
    throw err;
  }

  await redis.del(codeKey);

  const adminUser = await strapi.query('admin::user').findOne({
    where: { email, isActive: true },
  });

  if (!adminUser) {
    const err: any = new Error('账号不存在或已禁用');
    err.status = 401;
    throw err;
  }

  const token = strapi.admin.services.token.createJwtToken(adminUser);

  return {
    token,
    user: {
      id: adminUser.id,
      email: adminUser.email,
      firstname: adminUser.firstname,
      lastname: adminUser.lastname,
    },
  };
}

export default {
  register({ strapi }) {
    // --- Redis setup ---
    const useRedis = process.env.REDIS_HOST && process.env.REDIS_HOST !== '';

    if (useRedis) {
      import('ioredis').then(({ default: Redis }) => {
        const redis = new Redis({
          host: process.env.REDIS_HOST!,
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: 3,
          retryStrategy(times) {
            return Math.min(times * 200, 2000);
          },
        });
        redis.on('connect', () => strapi.log.info('Redis connected'));
        redis.on('error', (err) => strapi.log.error('Redis error:', err.message));
        (strapi as any).redis = redis;
      });
    } else {
      strapi.log.info('Using in-memory store (no Redis configured)');
      (strapi as any).redis = new MemoryStore();
    }

    // --- Register email-auth custom routes (no content type needed) ---
    strapi.server.routes([
      {
        method: 'POST',
        path: '/api/email-auth/send-code',
        handler: async (ctx) => {
          const { email } = ctx.request.body as { email?: string };

          if (!email) {
            return ctx.badRequest('邮箱不能为空');
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return ctx.badRequest('邮箱格式不正确');
          }

          if (!email.endsWith('@minxinhui.com')) {
            return ctx.badRequest('仅限 @minxinhui.com 域名邮箱');
          }

          try {
            await emailAuthSendCode(strapi, email);
            ctx.send({ message: '验证码已发送' });
          } catch (err: any) {
            if (err.status === 429) {
              ctx.status = 429;
              ctx.body = { error: { message: err.message || '请60秒后再试' } };
              return;
            }
            strapi.log.error('sendCode error:', err);
            return ctx.internalServerError('发送验证码失败');
          }
        },
        config: { auth: false },
      },
      {
        method: 'POST',
        path: '/api/email-auth/login',
        handler: async (ctx) => {
          const { email, code } = ctx.request.body as { email?: string; code?: string };

          if (!email || !code) {
            return ctx.badRequest('邮箱和验证码不能为空');
          }

          try {
            const result = await emailAuthLogin(strapi, email, code);
            ctx.send({ data: result });
          } catch (err: any) {
            if (err.status === 401) {
              return ctx.unauthorized(err.message);
            }
            strapi.log.error('login error:', err);
            return ctx.internalServerError('登录失败');
          }
        },
        config: { auth: false },
      },
    ]);
  },

  async bootstrap({ strapi }) {
    strapi.log.info('Xinghui CMS bootstrapped');

    try {
      const now = new Date();

      // Seed categories (Strapi v5: publishedAt 必须设置才能通过 REST API 查到)
      const categoryCount = await strapi.query('api::category.category').count();
      if (categoryCount === 0) {
        const categories = [
          { name: '公司新闻', slug: 'company-news' },
          { name: '行业资讯', slug: 'industry-news' },
          { name: '公告通知', slug: 'announcements' },
        ];
        for (const cat of categories) {
          await strapi.query('api::category.category').create({
            data: { ...cat, publishedAt: now },
          });
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
            publishedAt: now,
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
            publishedAt: now,
          },
        });
        strapi.log.info('Seeded homepage');
      }
      // 修复：将所有草稿种子数据发布（之前遗漏 publishedAt 的记录）
      const uids = [
        'api::category.category',
        'api::company-info.company-info',
        'api::homepage.homepage',
      ];
      for (const uid of uids) {
        await strapi.query(uid).updateMany({
          where: { publishedAt: null },
          data: { publishedAt: now },
        });
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
