import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import './AdminArea.css';

export const AdminArea: React.FC = () => {
  // Redirecionar para o dashboard diretamente
  return <Navigate to="/admin/dashboard" replace />;
};

