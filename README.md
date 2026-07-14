# Connect Digitals — Admin Dashboard

React admin dashboard for managing CMS content.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS
- TanStack Query (data fetching)
- Zustand (auth state)
- React Hook Form
- React Hot Toast

## Quick Start

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env
# Set VITE_API_URL=https://your-backend.onrender.com/api/v1

# 3. Start dev server (port 5174)
npm run dev

# 4. Build for production
npm run build
```

## Features
- Dashboard with live statistics
- Hero Slider CRUD + image upload
- Portfolio CRUD with category filtering, search, pagination
- Case Studies CRUD
- Blog CRUD with draft/published workflow
- Trusted Brands CRUD
- Testimonials CRUD
- Settings (general, SEO, social links, admin profile)
- JWT auth with auto-refresh
- Protected routes
