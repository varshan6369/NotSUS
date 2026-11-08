import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, Search, Menu, X, ShieldCheck } from 'lucide-react';
import { checkAdminStatus } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus().then(setIsAdmin).catch(() => setIsAdmin(false));
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Tools', path: '/tools' },
    { label: 'Library', path: '/library' },
    { label: 'FAQ', path: '/faq' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#242424] bg-[#050505]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <svg
            className="w-5 h-5 text-[#20D989] transition-transform duration-300 group-hover:rotate-45"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* 4-point sparkle matching mockup */}
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
          <span className="font-mono text-base font-semibold tracking-wide text-[#F2F2F2] group-hover:text-[#20D989] transition-colors">
            ASCII Launcher
          </span>
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-5 font-mono text-sm tracking-wider transition-colors whitespace-nowrap ${
                  active ? 'text-[#F2F2F2]' : 'text-[#999999] hover:text-[#F2F2F2]'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#20D989] shadow-[0_0_8px_#20D989]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/tools"
            className="p-2 text-[#999999] hover:text-[#20D989] hover:bg-[#101010] border border-transparent hover:border-[#242424] rounded transition-colors"
            title="Search Tools"
            aria-label="Search Tools"
          >
            <Search className="w-4 h-4" />
          </Link>

          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-[#20D989] bg-[#0A0A0A] border border-[#20D989]/50 hover:border-[#20D989] rounded transition-all hover:shadow-[0_0_10px_rgba(32,217,137,0.2)]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#20D989]" />
              <span>Admin Panel</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs text-[#999999] hover:text-[#F2F2F2] bg-[#0A0A0A] border border-[#242424] hover:border-[#666666] rounded transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-[#20D989]" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#999999] hover:text-[#F2F2F2] border border-[#242424] rounded"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#242424] bg-[#080808] px-4 pt-2 pb-6 space-y-3 font-mono">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm rounded ${
                isActive(link.path)
                  ? 'text-[#20D989] bg-[#121212]'
                  : 'text-[#999999] hover:text-[#F2F2F2] hover:bg-[#0E0E0E]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#242424] flex items-center justify-between">
            <Link
              to="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs text-[#999999] hover:text-[#20D989] py-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Library</span>
            </Link>
            {isAdmin ? (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#20D989] border border-[#20D989] rounded"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#999999] border border-[#242424] rounded"
              >
                <Lock className="w-3.5 h-3.5 text-[#20D989]" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
