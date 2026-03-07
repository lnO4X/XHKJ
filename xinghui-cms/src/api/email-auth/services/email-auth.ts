import crypto from 'crypto';
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async sendCode(email: string) {
    const redis = (strapi as any).redis;
    if (!redis) {
      throw new Error('Redis not available');
    }

    // Rate limit: 60s per email
    const rateLimitKey = `rate_limit:send_code:${email}`;
    const exists = await redis.exists(rateLimitKey);
    if (exists) {
      const err: any = new Error('请60秒后再试');
      err.status = 429;
      throw err;
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Store code in Redis with 5min TTL
    const codeKey = `email_code:${email}`;
    await redis.set(codeKey, code, 'EX', 300);

    // Set rate limit: 60s
    await redis.set(rateLimitKey, '1', 'EX', 60);

    // Send email via Strapi email plugin
    await strapi.plugins['email'].services.email.send({
      to: email,
      subject: '薪汇科技 CMS - 登录验证码',
      text: `您的验证码是：${code}，有效期5分钟。`,
      html: `<p>您的验证码是：<strong>${code}</strong></p><p>有效期5分钟，请勿泄露给他人。</p>`,
    });

    return true;
  },

  async login(email: string, code: string) {
    const redis = (strapi as any).redis;
    if (!redis) {
      throw new Error('Redis not available');
    }

    // Verify code
    const codeKey = `email_code:${email}`;
    const storedCode = await redis.get(codeKey);

    if (!storedCode || storedCode !== code) {
      const err: any = new Error('验证码错误或已过期');
      err.status = 401;
      throw err;
    }

    // Delete code (one-time use)
    await redis.del(codeKey);

    // Find admin user by email
    const adminUser = await strapi.query('admin::user').findOne({
      where: { email, isActive: true },
    });

    if (!adminUser) {
      const err: any = new Error('账号不存在或已禁用');
      err.status = 401;
      throw err;
    }

    // Issue JWT
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
  },
});
