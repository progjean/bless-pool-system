import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { LanguageSelector } from '../components/LanguageSelector';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-content-header">
          <LanguageSelector />
        </div>
        <div className="admin-content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

