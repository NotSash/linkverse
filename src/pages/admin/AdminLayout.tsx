/**
 * Admin Layout — src/pages/admin/AdminLayout.tsx
 *
 * Wrapper layout for all admin pages.
 * Uses AdminSidebar from the components folder.
 *
 * NOTE: AdminSidebar.tsx also exports an AdminLayout — this file
 * is the canonical one used by the router. The export from
 * AdminSidebar.tsx should be removed to avoid confusion.
 */

import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  const navigate = useNavigate();

  // Check admin auth on mount
  useEffect(() => {
    const token = localStorage.getItem('linkverse_admin_token');
    if (!token) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* 
        Desktop: sidebar is 64 (w-64 = 256px) fixed left
        Mobile: top header ~56px (pt-14), bottom nav ~64px (pb-20) 
      */}
      <main className="md:pl-64 pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}