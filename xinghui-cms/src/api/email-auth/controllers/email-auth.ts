import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async sendCode(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('邮箱不能为空');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ctx.badRequest('邮箱格式不正确');
    }

    // Only allow @minxinhui.com domain
    if (!email.endsWith('@minxinhui.com')) {
      return ctx.badRequest('仅限 @minxinhui.com 域名邮箱');
    }

    try {
      await strapi.service('api::email-auth.email-auth').sendCode(email);
      ctx.send({ message: '验证码已发送' });
    } catch (err: any) {
      if (err.status === 429) {
        return ctx.tooManyRequests(err.message || '请60秒后再试');
      }
      strapi.log.error('sendCode error:', err);
      return ctx.internalServerError('发送验证码失败');
    }
  },

  async login(ctx) {
    const { email, code } = ctx.request.body;

    if (!email || !code) {
      return ctx.badRequest('邮箱和验证码不能为空');
    }

    try {
      const result = await strapi.service('api::email-auth.email-auth').login(email, code);
      ctx.send({ data: result });
    } catch (err: any) {
      if (err.status === 401) {
        return ctx.unauthorized(err.message);
      }
      strapi.log.error('login error:', err);
      return ctx.internalServerError('登录失败');
    }
  },
});
