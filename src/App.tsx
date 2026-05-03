import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';

// Lazy load components
import InvitationPage from './pages/InvitationPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardLayout from './pages/admin/DashboardLayout';
import DashboardHome from './pages/admin/DashboardHome';
import EventManager from './pages/admin/EventManager';
import GuestManager from './pages/admin/GuestManager';
import GalleryManager from './pages/admin/GalleryManager';
import WebsiteCustomizer from './pages/admin/WebsiteCustomizer';
import RSVPPanel from './pages/admin/RSVPPanel';
import QRCodePage from './pages/admin/QRCodePage';
import SettingsPage from './pages/admin/SettingsPage';
import WeddingsList from './pages/admin/WeddingsList'; // Added import

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center font-serif text-2xl animate-pulse">Eternal Vows...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Invitation */}
          <Route path="/:weddingId" element={<InvitationPage />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <Navigate to="/admin/weddings" replace />
            </ProtectedAdminRoute>
          } />
          
          <Route path="/admin/weddings" element={
            <ProtectedAdminRoute>
              <WeddingsList />
            </ProtectedAdminRoute>
          } />

          <Route path="/admin/:weddingId" element={
            <ProtectedAdminRoute>
              <DashboardLayout />
            </ProtectedAdminRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="events" element={<EventManager />} />
            <Route path="guests" element={<GuestManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="customize" element={<WebsiteCustomizer />} />
            <Route path="rsvp" element={<RSVPPanel />} />
            <Route path="qrcode" element={<QRCodePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<div className="h-screen flex items-center justify-center font-serif text-stone-400">Please provide a valid invitation link.</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
