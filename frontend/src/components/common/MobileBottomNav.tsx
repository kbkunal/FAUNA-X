import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Stethoscope, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { role, user } = useAuth();
  if (!user) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 text-slate-600 flex justify-around items-center py-1.5 px-2 shadow-lg safe-bottom">
      {role === 'FARMER' && (
        <>
          <NavLink
            to="/farmer/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/farmer/report"
            className={({ isActive }) =>
              `flex items-center gap-1.5 py-2 px-5 text-xs font-black rounded-full min-h-[44px] ${
                isActive ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
              } -translate-y-2 shadow-md shadow-blue-500/30 active:scale-95 transition-transform`
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report Issue</span>
          </NavLink>
        </>
      )}

      {(role === 'VETERINARIAN' || role === 'FIELD_OFFICER') && (
        <>
          <NavLink
            to="/vet/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Stethoscope className="w-5 h-5 mb-0.5" />
            <span>Triage</span>
          </NavLink>
          <NavLink
            to="/farmer/report"
            className={({ isActive }) =>
              `flex items-center gap-1.5 py-2 px-4 text-xs font-black rounded-full min-h-[44px] bg-blue-600 text-white -translate-y-2 shadow-md shadow-blue-500/30 active:scale-95 transition-transform`
            }
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Case</span>
          </NavLink>
          <NavLink
            to="/vet/clusters"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Map className="w-5 h-5 mb-0.5" />
            <span>Clusters</span>
          </NavLink>
        </>
      )}

      {(role === 'GOVERNMENT' || role === 'DISTRICT_ADMIN' || role === 'STATE_ADMIN' || role === 'NATIONAL_ADMIN' || role === 'ADMIN') && (
        <>
          <NavLink
            to="/government/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Map className="w-5 h-5 mb-0.5" />
            <span>GIS Map</span>
          </NavLink>
          <NavLink
            to="/vet/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Stethoscope className="w-5 h-5 mb-0.5" />
            <span>Clinical</span>
          </NavLink>
          <NavLink
            to="/government/clusters"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-3 text-[10px] font-bold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Clusters</span>
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default MobileBottomNav;
