'use client';

import React from 'react';
import AdminGuard from '@/components/admin-guard';
import NewAdminDashboard from '@/components/admin/new-admin-dashboard';

const AdminDashboardPage = () => {
  return (
    <AdminGuard>
      <NewAdminDashboard />
    </AdminGuard>
  );
};

export default AdminDashboardPage;
