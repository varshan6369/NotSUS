import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Public Pages
import { Home } from './pages/Home';
import { Tools } from './pages/Tools';
import { ToolDetail } from './pages/ToolDetail';
import { Library } from './pages/Library';
import { FAQ } from './pages/FAQ';
import { About } from './pages/About';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminTools } from './pages/admin/AdminTools';
import { ToolEditor } from './pages/admin/ToolEditor';
import { AdminPackages } from './pages/admin/AdminPackages';
import { AdminSettings } from './pages/admin/AdminSettings';

// Public Layout Container
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F2F2F2]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/:slug" element={<ToolDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={
              <div className="min-h-screen flex flex-col bg-[#050505]">
                <Navbar />
                <main className="flex-1">
                  <AdminLogin />
                </main>
                <Footer />
              </div>
            }
          />

          {/* Admin Dashboard Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="tools" element={<AdminTools />} />
            <Route path="tools/new" element={<ToolEditor />} />
            <Route path="tools/:id/edit" element={<ToolEditor />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
