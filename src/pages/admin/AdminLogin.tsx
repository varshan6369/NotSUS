import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { loginAdmin, setAdminToken } from '../../services/api';
import { useToast } from '../../components/Toast';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please provide administrator password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginAdmin(password.trim());
      showToast('ADMINISTRATOR SESSION AUTHORIZED', 'success');
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator password');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantAccess = () => {
    setAdminToken('ascii-launcher-admin-session-authorized');
    showToast('INSTANT ADMIN ACCESS GRANTED', 'success');
    navigate('/admin');
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 font-mono">
      <div className="w-full max-w-md border border-[#242424] bg-[#0A0A0A] rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl relative crt-scanlines">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5555]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#20D989]" />
          </div>
          <span className="text-[11px] text-[#666666] tracking-wider uppercase">SECURE ADMIN GATEWAY</span>
        </div>

        {/* Branding & Prompt */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border border-[#20D989]/40 rounded-full flex items-center justify-center text-[#20D989] mx-auto bg-[#060606] shadow-[0_0_15px_rgba(32,217,137,0.15)]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-[#F2F2F2] tracking-tight">
            Administrator Authentication
          </h1>
          <p className="text-xs text-[#666666]">
            Enter master key to configure packages, manage utilities, and inspect system integrity.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#1A0A0A] border border-[#FF5555] rounded text-[#FF5555] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-[#999999] tracking-wider uppercase">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-[#050505] border border-[#242424] focus:border-[#20D989] rounded px-4 py-2.5 text-xs text-[#F2F2F2] placeholder-[#555555] outline-none pr-10 transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#F2F2F2]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Key helper */}
          <div className="p-3 bg-[#080808] border border-[#1A1A1A] rounded text-[11px] text-[#666666] flex items-center justify-between">
            <span>Key: <strong className="text-[#20D989]">admin123</strong></span>
            <button
              type="button"
              onClick={() => setPassword('admin123')}
              className="text-[#20D989] hover:underline"
            >
              Fill Key
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#20D989] hover:bg-[#1bb874] text-black text-xs font-bold tracking-wider uppercase rounded transition-all shadow-[0_0_15px_rgba(32,217,137,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'VERIFYING CREDENTIALS...' : 'AUTHENTICATE ADMIN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Instant Bypass for Iframe previews */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleInstantAccess}
            className="w-full py-2.5 px-4 bg-[#080808] hover:bg-[#121212] border border-[#20D989]/40 hover:border-[#20D989] text-[#20D989] text-xs font-semibold rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-CLICK DIRECT ADMIN ACCESS</span>
          </button>
        </div>

        <div className="text-center text-[10px] text-[#444444]">
          ASCII LAUNCHER SECURITY ARCHITECTURE · LOCAL STORAGE SESSION TOKEN
        </div>
      </div>
    </div>
  );
};
