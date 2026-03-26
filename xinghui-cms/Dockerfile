FROM node:22-alpine AS builder
RUN sed -i "s/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g" /etc/apk/repositories
RUN apk add --no-cache build-base python3
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN mkdir -p public/uploads
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src
# Strapi v5 looks for admin build at this path in production
RUN mkdir -p node_modules/@strapi/admin/dist/server/server && ln -sf /app/dist/build node_modules/@strapi/admin/dist/server/server/build
ENV NODE_ENV=production
EXPOSE 1337
CMD ["npm", "run", "start"]
