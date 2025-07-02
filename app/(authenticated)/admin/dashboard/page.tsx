'use client';

import React from 'react';
import AdminGuard from '@/components/admin-guard';
import AdminDashboard from '@/components/admin/dashboard';

const AdminDashboardPage = () => {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
};

export default AdminDashboardPage;
