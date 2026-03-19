export default {
  config: {
    // 管理面板默认显示简体中文
    locales: ['zh-Hans'],

    // 隐藏 Strapi 教程和版本通知
    tutorials: false,
    notifications: { releases: false },

    // 自定义翻译覆盖（替换登录页面的 Strapi 相关文案）
    translations: {
      'zh-Hans': {
        'Auth.form.welcome.title': '薪汇科技 CMS',
        'Auth.form.welcome.subtitle': '内容管理系统',
        'app.components.LeftMenu.navbrand.title': '薪汇科技',
        'app.components.LeftMenu.navbrand.workplace': '内容管理平台',
        'HomePage.helmet.title': '薪汇科技 CMS',
        'global.documentTitle': '薪汇科技 CMS',
      },
      en: {
        'Auth.form.welcome.title': 'XinHui CMS',
        'Auth.form.welcome.subtitle': 'Content Management System',
        'app.components.LeftMenu.navbrand.title': 'XinHui Tech',
        'app.components.LeftMenu.navbrand.workplace': 'CMS Platform',
        'HomePage.helmet.title': 'XinHui CMS',
        'global.documentTitle': 'XinHui CMS',
      },
    },
  },
  bootstrap() {
    // 注入自定义样式：隐藏 Strapi 品牌标识
    const style = document.createElement('style');
    style.textContent = `
      /* 隐藏左侧栏底部 Strapi logo */
      a[href*="strapi.io"], a[href*="strapi.com"] {
        display: none !important;
      }
      /* 隐藏页面标题中的 Strapi 文字 */
      [class*="PoweredBy"], [data-strapi-logo] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  },
};
