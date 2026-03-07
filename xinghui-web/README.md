# 薪汇科技官网 - XinHui Technology Website

Modern Nuxt 3 SSR (Server-Side Rendering) website for XinHui Technology, a data service provider.

## Technology Stack

- **Framework**: Nuxt 3 (Vue 3)
- **Styling**: Tailwind CSS
- **Runtime**: Node.js 20+
- **Build**: Vite
- **Testing**: Vitest
- **CMS**: Strapi (optional)
- **Deployment**: Docker support included

## Project Structure

```
xinghui-web/
├── app.vue                          # Root component
├── nuxt.config.ts                   # Nuxt configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Project dependencies
├── Dockerfile                       # Production Docker build
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
│
├── assets/
│   └── css/
│       └── main.css                # Global styles with Tailwind
│
├── layouts/
│   └── default.vue                 # Default layout wrapper
│
├── pages/                           # Nuxt file-based routing
├── components/                      # Reusable Vue components
├── composables/                     # Vue composition utilities
├── plugins/                         # Nuxt plugins
└── public/                          # Static assets
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Configure your environment variables
# Edit .env with your Strapi URL and site configuration
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Development server will run at http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate static site (if needed)
npm run generate
```

### Testing

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Docker Deployment

```bash
# Build Docker image
docker build -t xinghui-web:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e STRAPI_URL=https://api.xinghui.com \
  -e SITE_URL=https://xinghui.com \
  xinghui-web:latest
```

## Configuration

### Environment Variables

See `.env.example` for all available environment variables:

- `STRAPI_URL`: Strapi CMS API endpoint
- `SITE_URL`: Your website URL
- `WECHAT_APP_ID`: WeChat integration (optional)
- `WECHAT_APP_SECRET`: WeChat integration (optional)

### Tailwind CSS

Custom color palette with primary brand colors (blue #0052D9):
- Primary color variants (50-900)
- Dark theme colors
- PingFang SC font family for Chinese typography

### Route Caching (ISR)

Incremental Static Regeneration (ISR) is configured for:
- Homepage: 60 seconds
- Products page: 60 seconds
- About page: 3600 seconds
- News section: 60 seconds

## Features

- Vue 3 Composition API support
- Server-Side Rendering (SSR) for better SEO
- Tailwind CSS for rapid UI development
- TypeScript for type safety
- Strapi CMS integration ready
- Responsive design with mobile-first approach
- Progressive enhancement
- Optimized static asset compression
- WeChat integration support (optional)

## Development Tips

### Creating Pages

Pages are automatically routed based on their filename in the `pages/` directory:
```
pages/
├── index.vue          → /
├── about.vue          → /about
└── products/
    ├── index.vue      → /products
    └── [id].vue       → /products/:id
```

### Creating Components

Place reusable components in the `components/` directory. They are auto-imported:
```
components/
├── layout/
│   ├── AppHeader.vue
│   └── AppFooter.vue
├── common/
│   └── Button.vue
```

### Using Composables

Create reusable composition functions in `composables/`:
```typescript
// composables/useSeo.ts
export const useSeo = (title: string, description: string) => {
  useHead({
    title,
    meta: [{ name: 'description', content: description }]
  })
}
```

## Performance

- Automatic code splitting
- Image optimization
- CSS purging with Tailwind
- Asset compression via Nitro
- ISR for static content caching

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## SEO Optimizations

- Server-side rendering for better indexing
- Automatic meta tag generation
- Open Graph support ready
- Structured data support ready
- XML sitemap generation available

## License

All rights reserved. XinHui Technology Co., Ltd.

## Support

For issues and questions, contact the development team.
