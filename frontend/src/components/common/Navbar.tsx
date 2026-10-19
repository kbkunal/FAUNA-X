import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Activity, User as UserIcon, LogOut, Wifi, WifiOff, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AIHealthStatus } from '../../types';

export const Navbar: React.FC<{ toggleSidebar?: () => void }> = ({ toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [aiHealth, setAiHealth] = useState<AIHealthStatus | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    api.getAIHealth().then(setAiHealth).catch(() => setAiHealth({ status: 'unavailable' }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-xs transition-colors">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {user && toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 active:bg-slate-200 focus:outline-none transition-colors shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center space-x-2 group min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="truncate">
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-navy-950">
              FAUNA<span className="text-blue-600">-X</span>
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-l border-slate-200 pl-2">
              National Surveillance
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Offline / Online indicator */}
        <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200" title={isOnline ? 'Online' : 'Offline'}>
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-600 font-medium hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-semibold text-[11px] sm:text-xs">Offline</span>
            </>
          )}
        </div>

        {/* AI Engine Status */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/70">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-600 font-medium">AI Vision:</span>
          {aiHealth?.status === 'ready' ? (
            <span className="flex items-center text-blue-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              {aiHealth.device?.includes('NVIDIA') ? 'GPU Active' : 'Ready'}
            </span>
          ) : (
            <span className="text-slate-500">Standby</span>
          )}
        </div>

        {/* Auth / Profile */}
        {user ? (
          <div className="flex items-center space-x-1.5 sm:space-x-3 pl-1.5 sm:pl-2 border-l border-slate-200">
            {/* Desktop user text */}
            <div className="hidden sm:flex flex-col text-right max-w-[140px] truncate">
              <span className="text-xs font-bold text-navy-950 truncate">{user.full_name}</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-600 font-mono font-semibold">{role}</span>
            </div>

            {/* Mobile user role pill */}
            <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-xs border border-blue-200" title={`${user.full_name} (${role})`}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="min-h-[38px] px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
