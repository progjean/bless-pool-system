import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { AdminHub } from './pages/AdminHub';
import { AdminLayout } from './pages/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerFormPage } from './pages/CustomerFormPage';
import { CustomerDetailsPage } from './pages/CustomerDetailsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { InvoiceFormPage } from './pages/InvoiceFormPage';
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { WorkOrderFormPage } from './pages/WorkOrderFormPage';
import { WorkOrderDetailsPage } from './pages/WorkOrderDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { InvoiceSettingsPage } from './pages/InvoiceSettingsPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ReportsPage } from './pages/ReportsPage';
import { ServiceMessagesPage } from './pages/ServiceMessagesPage';
import { SupervisorSelector } from './pages/SupervisorSelector';
import { WorkArea } from './pages/WorkArea';
import { ServicePage } from './pages/ServicePage';
import { UsersPage } from './pages/UsersPage';
import { UserRole } from './types/user';
import { registerSW } from './utils/pwa';
import { syncManager } from './utils/syncManager';
import { SyncStatus } from './components/SyncStatus';
import './App.css';

function App() {
  useEffect(() => {
    // Registrar Service Worker para PWA
    registerSW();
    
    // Iniciar sincronização automática
    syncManager.startAutoSync(30000); // Sincronizar a cada 30 segundos
    
    return () => {
      syncManager.stopAutoSync();
    };
  }, []);

  return (
    <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <SyncStatus />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/admin-hub"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminHub />
                </ProtectedRoute>
              }
            />
            
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/new" element={<CustomerFormPage />} />
            <Route path="customers/:customerId" element={<CustomerDetailsPage />} />
            <Route path="customers/:customerId/edit" element={<CustomerFormPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<InvoiceFormPage />} />
            <Route path="invoices/:invoiceId" element={<InvoiceDetailsPage />} />
            <Route path="work-orders" element={<WorkOrdersPage />} />
            <Route path="work-orders/new" element={<WorkOrderFormPage />} />
            <Route path="work-orders/:workOrderId" element={<WorkOrderDetailsPage />} />
            <Route path="work-orders/:workOrderId/edit" element={<WorkOrderFormPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/invoices" element={<InvoiceSettingsPage />} />
            <Route path="settings/service-messages" element={<ServiceMessagesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
            
            <Route
              path="/supervisor-selector"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPERVISOR]}>
                  <SupervisorSelector />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/work"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TECHNICIAN]}>
                  <WorkArea />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/work/service/:clientId"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TECHNICIAN]}>
                  <ServicePage />
                </ProtectedRoute>
              }
            />
            
            {/* Rota para técnicos criarem work orders */}
            <Route
              path="/work/work-orders/new"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.TECHNICIAN]}>
                  <WorkOrderFormPage />
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
