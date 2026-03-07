import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::message.message', ({ strapi }) => ({
  async create(ctx) {
    // Strip isRead from public submissions — always default to false
    if (ctx.request.body?.data) {
      delete ctx.request.body.data.isRead;
    }
    const response = await super.create(ctx);
    return response;
  },
}));
