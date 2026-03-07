export const useWechat = () => {
  const config = useRuntimeConfig();

  async function initShare(options: { title: string; desc: string; link?: string; imgUrl?: string }) {
    if (!import.meta.client) return;
    try {
      const url = window.location.href.split('#')[0];
      const { data } = await $fetch<any>('/api/wechat/signature', { params: { url } });
      if (!data) return;

      await loadWechatSDK();
      const wx = (window as any).wx;
      if (!wx) return;

      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
      });

      wx.ready(() => {
        const shareData = {
          title: options.title,
          desc: options.desc,
          link: options.link || window.location.href,
          imgUrl: options.imgUrl || `${config.public.siteUrl}/og-cover.jpg`,
        };
        wx.updateAppMessageShareData(shareData);
        wx.updateTimelineShareData({ title: options.title, link: shareData.link, imgUrl: shareData.imgUrl });
      });
    } catch (err) {
      console.warn('WeChat SDK init failed:', err);
    }
  }

  function loadWechatSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).wx) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load WeChat SDK'));
      document.head.appendChild(script);
    });
  }

  return { initShare };
};
