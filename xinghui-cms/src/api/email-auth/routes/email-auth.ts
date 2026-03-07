export default {
  routes: [
    {
      method: 'POST',
      path: '/email-auth/send-code',
      handler: 'email-auth.sendCode',
      config: {
        auth: false,
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/email-auth/login',
      handler: 'email-auth.login',
      config: {
        auth: false,
        middlewares: [],
      },
    },
  ],
};
