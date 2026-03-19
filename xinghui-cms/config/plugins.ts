export default ({ env }) => ({
  // Email provider — 生产环境需要安装 @strapi/provider-email-nodemailer
  // npm install @strapi/provider-email-nodemailer
  // 开发环境使用默认 sendmail provider（邮件不会真正发送）
  ...(env('SMTP_HOST', '') ? {
    email: {
      config: {
        provider: '@strapi/provider-email-nodemailer',
        providerOptions: {
          host: env('SMTP_HOST'),
          port: env.int('SMTP_PORT', 465),
          secure: true,
          auth: {
            user: env('SMTP_USER', ''),
            pass: env('SMTP_PASS', ''),
          },
        },
        settings: {
          defaultFrom: env('SMTP_USER', 'noreply@minxinhui.com'),
          defaultReplyTo: env('SMTP_USER', 'noreply@minxinhui.com'),
        },
      },
    },
  } : {}),
});
