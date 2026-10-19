import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Stethoscope, Building2, ShieldAlert, Users, Compass, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo(role);
      if (role === 'FARMER') navigate('/farmer/dashboard');
      else if (role === 'VETERINARIAN') navigate('/vet/dashboard');
      else if (role === 'FIELD_OFFICER') navigate('/vet/dashboard');
      else navigate('/government/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-navy-950 tracking-tight">FAUNA-X Portal Access</h2>
          <p className="text-xs text-slate-500 font-medium">
            Livestock Health Surveillance & Early Outbreak Response Platform
          </p>
        </div>

        {/* 6-Role Instant Demo Switcher */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3.5 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Role-Based Access (6 Pre-Configured Profiles)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">One-click sign in</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* 1. Farmer */}
            <button
              type="button"
              onClick={() => handleDemoClick('FARMER')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
            >
              <div className="font-bold text-navy-950 flex items-center justify-between">
                <span>🌾 Farmer</span>
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">Ramesh Patil</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">Offline reporting, photo & voice</div>
            </button>

            {/* 2. Veterinarian */}
            <button
              type="button"
              onClick={() => handleDemoClick('VETERINARIAN')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
            >
              <div className="font-bold text-navy-950 flex items-center justify-between">
                <span>🩺 Veterinarian</span>
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">Dr. Anjali Deshmukh</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">Clinical triage, verification & lab</div>
            </button>

            {/* 3. Field Officer */}
            <button
              type="button"
              onClick={() => handleDemoClick('FIELD_OFFICER')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
            >
              <div className="font-bold text-navy-950 flex items-center justify-between">
                <span>📋 Field Officer</span>
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">Sanjay Shinde</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">Field visits & containment</div>
            </button>

            {/* 4. District Admin */}
            <button
              type="button"
              onClick={() => handleDemoClick('DISTRICT_ADMIN')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
            >
              <div className="font-bold text-navy-950 flex items-center justify-between">
                <span>🏛️ District Admin</span>
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">Pune District HQ</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">Hotspot tracking & local alerts</div>
            </button>

            {/* 5. State Admin */}
            <button
              type="button"
              onClick={() => handleDemoClick('STATE_ADMIN')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
            >
              <div className="font-bold text-navy-950 flex items-center justify-between">
                <span>🗺️ State Admin</span>
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">Maharashtra AH Dept</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">Forecasting & resources</div>
            </button>

            {/* 6. National Admin */}
            <button
              type="button"
              onClick={() => handleDemoClick('NATIONAL_ADMIN')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
            >
              <div className="font-bold text-navy-950 flex items-center justify-between">
                <span>🇮🇳 National Admin</span>
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">National Epidemiologist</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">National GIS & model drift</div>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 space-y-4 shadow-card">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@faunax.gov.in"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-navy-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
