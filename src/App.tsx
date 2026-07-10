import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { SocketManager } from './components/SocketManager';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ServiceDetails } from './pages/ServiceDetails';
import { Categories } from './pages/Categories';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';
import { AccessDenied } from './pages/AccessDenied';
import { Unauthorized } from './pages/Unauthorized';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OtpVerification } from './pages/auth/OtpVerification';
import { ResetPassword } from './pages/auth/ResetPassword';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerBookings } from './pages/customer/CustomerBookings';
import { CustomerFavorites } from './pages/customer/CustomerFavorites';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';
import { CustomerSettings } from './pages/customer/CustomerSettings';
import { CustomerProfileEdit } from './pages/customer/CustomerProfileEdit';
import { CustomerTracking } from './pages/customer/CustomerTracking';
import { CustomerPayments } from './pages/customer/CustomerPayments';

// Provider Pages
import { ProviderLayout } from './components/ProviderLayout';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ManageBookings } from './pages/provider/ManageBookings';
import { AddEditService } from './pages/provider/AddEditService';
import { AvailabilityCalendar } from './pages/provider/AvailabilityCalendar';
import { EarningsDashboard } from './pages/provider/EarningsDashboard';
import { EditProfile } from './pages/provider/EditProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ComplaintManagement } from './pages/admin/ComplaintManagement';


import { ProviderLogin } from './pages/provider/ProviderLogin';
import { ProviderRegister } from './pages/provider/ProviderRegister';
import { ProviderRequests } from './pages/provider/ProviderRequests';
import { ProviderOngoingJobs } from './pages/provider/ProviderOngoingJobs';
import { ProviderCompletedJobs } from './pages/provider/ProviderCompletedJobs';
import { ProviderTracking } from './pages/provider/ProviderTracking';
import { ProviderHistory } from './pages/provider/ProviderHistory';
import { ProviderSettings } from './pages/provider/ProviderSettings';
import { ProviderNotifications } from './pages/provider/ProviderNotifications';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-secondary dark:bg-bg-card text-primary-text flex flex-col ">
          
          {/* Main Navigation Bar */}
          <Navbar />

          {/* Dynamic Core Main View */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/home" element={<ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}><Home /></ProtectedRoute>} />
              <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<ProtectedRoute allowedRoles={['customer']}><Services /></ProtectedRoute>} />
              <Route path="/service/:id" element={<ProtectedRoute allowedRoles={['customer']}><ServiceDetails /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute allowedRoles={['customer']}><Categories /></ProtectedRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Customer Routes */}
              <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer']}><CustomerBookings /></ProtectedRoute>} />
              <Route path="/customer/favorites" element={<ProtectedRoute allowedRoles={['customer']}><CustomerFavorites /></ProtectedRoute>} />
              <Route path="/customer/notifications" element={<ProtectedRoute allowedRoles={['customer']}><CustomerNotifications /></ProtectedRoute>} />
              <Route path="/customer/settings" element={<ProtectedRoute allowedRoles={['customer']}><CustomerSettings /></ProtectedRoute>} />
              <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerProfileEdit /></ProtectedRoute>} />
              <Route path="/customer/tracking/:id" element={<ProtectedRoute allowedRoles={['customer']}><CustomerTracking /></ProtectedRoute>} />
              <Route path="/customer/payments" element={<ProtectedRoute allowedRoles={['customer']}><CustomerPayments /></ProtectedRoute>} />

              {/* Provider Routes */}
              <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<ProviderDashboard />} />
                <Route path="requests" element={<ProviderRequests />} />
                <Route path="bookings" element={<ManageBookings />} />
                <Route path="ongoing-jobs" element={<ProviderOngoingJobs />} />
                <Route path="completed-jobs" element={<ProviderCompletedJobs />} />
                <Route path="live-tracking" element={<ProviderTracking />} />
                <Route path="earnings" element={<EarningsDashboard />} />
                <Route path="profile" element={<EditProfile />} />
                <Route path="settings" element={<ProviderSettings />} />
                <Route path="notifications" element={<ProviderNotifications />} />
                <Route path="calendar" element={<AvailabilityCalendar />} />
                <Route path="add-service" element={<AddEditService />} />
              </Route>
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><ComplaintManagement /></ProtectedRoute>} />

              {/* Fallback 404 Route */}
              <Route path="*20" element={<Navigate to="/404" replace />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="/403" element={<AccessDenied />} />
              <Route path="/401" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Toast Notification Container */}
          <Toast />
          <SocketManager />

        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
