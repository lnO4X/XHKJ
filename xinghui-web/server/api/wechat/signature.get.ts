import crypto from 'crypto';

interface WechatTokenCache {
  accessToken: string;
  ticket: string;
  expiresAt: number;
}

let cache: WechatTokenCache | null = null;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const url = query.url as string;

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' });
  }

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    throw createError({ statusCode: 500, statusMessage: 'WeChat not configured' });
  }

  try {
    // Get or refresh ticket
    const now = Date.now();
    if (!cache || cache.expiresAt < now) {
      // Get access token
      const tokenRes = await $fetch<any>(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
      );
      const accessToken = tokenRes.access_token;

      // Get jsapi ticket
      const ticketRes = await $fetch<any>(
        `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
      );

      cache = {
        accessToken,
        ticket: ticketRes.ticket,
        expiresAt: now + 7000 * 1000, // ~7000s, less than 7200s
      };
    }

    // Generate signature
    const nonceStr = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);
    const str = `jsapi_ticket=${cache.ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    return {
      data: {
        appId,
        timestamp,
        nonceStr,
        signature,
      },
    };
  } catch (err) {
    console.error('WeChat signature error:', err);
    throw createError({ statusCode: 500, statusMessage: 'WeChat signature failed' });
  }
});
