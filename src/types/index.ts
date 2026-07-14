// ── API ───────────────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ── Auth ──────────────────────────────────────────────────────────
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: Admin;
}

// ── Hero Slide ────────────────────────────────────────────────────
export interface HeroSlide {
  id: string;
  backgroundImage: string;
  imagePublicId?: string;
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonUrl?: string;
  altText?: string;
  autoSlideDelay: number;
  displayOrder: number;
  status: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Portfolio ─────────────────────────────────────────────────────
export interface PortfolioProject {
  id: string;
  thumbnail: string;
  gallery: string[];
  title: string;
  slug: string;
  category: string;
  client?: string;
  industry?: string;
  year?: number;
  shortDescription?: string;
  fullDescription?: string;
  servicesProvided: string[];
  technologies: string[];
  projectUrl?: string;
  altText?: string;
  caseStudyChallenge?: string;
  caseStudySolution?: string;
  caseStudyResults?: { metric: string; value: string }[];
  featured: boolean;
  status: string;
  published: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Case Study ────────────────────────────────────────────────────
export interface CaseStudy {
  id: string;
  heroImage: string;
  gallery: string[];
  title: string;
  slug: string;
  client: string;
  industry?: string;
  overview?: string;
  challenge: string[];
  research?: string;
  strategy?: string;
  designProcess?: string;
  solution?: string;
  role: string[];
  results?: string;
  conclusion?: string;
  published: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Blog ──────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  featuredImage?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags: string[];
  author: string;
  readingTime?: number;
  status: string;
  published: boolean;
  publishedAt?: string;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Trusted Brand ─────────────────────────────────────────────────
export interface TrustedBrand {
  id: string;
  logo: string;
  name: string;
  website?: string;
  altText?: string;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Testimonial ───────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  clientPhoto?: string;
  clientName: string;
  position?: string;
  company?: string;
  review: string;
  rating: number;
  href?: string;
  featured: boolean;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Settings ──────────────────────────────────────────────────────
export interface Settings {
  id: string;
  websiteName: string;
  logo?: string;
  favicon?: string;
  tagline?: string;
  slogan?: string;
  statProjects?: number;
  statSatisfaction?: number;
  statExperience?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialWhatsapp?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// ── Analytics ─────────────────────────────────────────────────────
export interface AnalyticsStats {
  totals: { allTime: number; last30: number; last7: number };
  byPage: { home: number; portfolio: number; blog: number; caseStudies: number; contact: number };
  leads: { total: number; new: number };
  topPortfolio: { slug: string | null; views: number }[];
  topBlog: { slug: string | null; views: number }[];
  topCaseStudy: { slug: string | null; views: number }[];
  daily: { day: string; count: number }[];
}
export interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  status: 'new' | 'contacted' | 'negotiating' | 'won' | 'lost';
  notes?: string;
  submittedAt: string;
  updatedAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  action: 'created' | 'updated' | 'published' | 'deleted';
  entity: 'portfolio' | 'blog' | 'hero' | 'case-study' | 'testimonial' | 'trusted-brand' | 'settings' | 'lead';
  entityId: string;
  title: string;
  createdAt: string;
}

export interface DashboardStats {
  counts: {
    heroSlides: number;
    portfolioProjects: number;
    caseStudies: number;
    blogPosts: number;
    trustedBrands: number;
    testimonials: number;
    newLeads: number;
  };
  published: {
    heroSlides: number;
    portfolioProjects: number;
    caseStudies: number;
    blogPosts: number;
    trustedBrands: number;
    testimonials: number;
  };
  recentActivity: ActivityLogEntry[];
}
