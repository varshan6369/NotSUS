import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  PackageCheck,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { checkAdminStatus, logoutAdmin } from '../services/api';
import { useToast } from './Toast';

export const AdminLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    checkAdminStatus().then((isAuthed) => {
      setAuthorized(isAuthed);
      setLoading(false);
      if (!isAuthed) {
        showToast('ADMIN AUTHENTICATION REQUIRED', 'warning');
        navigate('/admin/login');
      }
    });
  }, [location.pathname, navigate, showToast]);

  const handleLogout = async () => {
    await logoutAdmin();
    showToast('ADMINISTRATOR SIGNED OUT', 'info');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Tools', path: '/admin/tools', icon: Wrench },
    { label: 'Create Tool', path: '/admin/tools/new', icon: PlusCircle },
    { label: 'Packages', path: '/admin/packages', icon: PackageCheck },
    { label: 'Settings & Backups', path: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-[#20D989]">
        <span className="flex items-center gap-2">
          <Terminal className="w-4 h-4 animate-spin" />
          VERIFYING ADMINISTRATOR PRIVILEGES...
        </span>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2] flex flex-col font-mono">
      {/* Top Admin Header */}
      <header className="border-b border-[#242424] bg-[#0A0A0A] px-4 sm:px-6 h-14 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2 text-sm font-bold text-[#F2F2F2] hover:text-[#20D989] transition-colors">
            <span className="text-[#20D989]">✦</span>
            <span>ASCII Launcher</span>
            <span className="text-[10px] text-[#20D989] border border-[#20D989]/50 px-1.5 py-0.2 rounded bg-[#060606]">
              ROOT ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#999999] hover:text-[#20D989] transition-colors"
          >
            <span>Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[#FF5555] hover:text-[#ff7777] px-2.5 py-1 border border-[#FF5555]/30 hover:border-[#FF5555] rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#242424] bg-[#080808] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] text-[#666666] uppercase tracking-wider">
              Management Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors ${
                    isActive
                      ? 'bg-[#141414] text-[#20D989] font-semibold border-l-2 border-[#20D989]'
                      : 'text-[#999999] hover:text-[#F2F2F2] hover:bg-[#0D0D0D]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-[#1C1C1C] text-[11px] text-[#555555] space-y-1 hidden md:block">
            <div className="flex items-center gap-1.5 text-[#20D989]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20D989]" />
              <span>Session: Active</span>
            </div>
            <div>Storage: Local JSON Cache</div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#050505] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
