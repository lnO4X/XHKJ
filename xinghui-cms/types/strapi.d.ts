import type Redis from 'ioredis';

declare module '@strapi/strapi' {
  interface Strapi {
    redis: Redis;
  }
}
