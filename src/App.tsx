import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import HeroSlider from '@/pages/HeroSlider';
import Portfolio from '@/pages/Portfolio';
import CaseStudies from '@/pages/CaseStudies';
import Blog from '@/pages/Blog';
import TrustedBrands from '@/pages/TrustedBrands';
import Testimonials from '@/pages/Testimonials';
import Leads from '@/pages/Leads';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #374151' },
          success: { iconTheme: { primary: '#10b981', secondary: '#1f2937' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1f2937' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="hero" element={<HeroSlider />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="blog" element={<Blog />} />
          <Route path="trusted-brands" element={<TrustedBrands />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="leads" element={<Leads />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
