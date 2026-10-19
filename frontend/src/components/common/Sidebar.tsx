import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Stethoscope,
  Map,
  Layers,
  Cpu,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const farmerLinks = [
    { to: '/farmer/dashboard', label: 'My Herd Dashboard', icon: LayoutDashboard },
    { to: '/farmer/report', label: 'Report Health Issue', icon: PlusCircle },
  ];

  const vetLinks = [
    { to: '/vet/dashboard', label: 'Clinical Triage Worklist', icon: Stethoscope },
    { to: '/farmer/report', label: 'New Field Case Report', icon: PlusCircle },
    { to: '/vet/clusters', label: 'Spatial-Temporal Clusters', icon: Layers },
  ];

  const fieldOfficerLinks = [
    { to: '/vet/dashboard', label: 'Field Investigation Triage', icon: Stethoscope },
    { to: '/farmer/report', label: 'Report Animal Case', icon: PlusCircle },
    { to: '/government/dashboard', label: 'Jurisdiction Surveillance GIS', icon: Map },
  ];

  const govtLinks = [
    { to: '/government/dashboard', label: 'Surveillance GIS & Epidemics', icon: Map },
    { to: '/government/clusters', label: 'Outbreak Hotspots & Clusters', icon: Layers },
    { to: '/admin/models', label: 'AI Model Registry & Telemetry', icon: Cpu },
  ];

  const adminLinks = [
    { to: '/government/dashboard', label: 'National Surveillance GIS', icon: Map },
    { to: '/vet/dashboard', label: 'Clinical Triage Worklist', icon: Stethoscope },
    { to: '/farmer/dashboard', label: 'Farmer Herd Overview', icon: LayoutDashboard },
    { to: '/farmer/report', label: 'Report Health Issue', icon: PlusCircle },
    { to: '/admin/models', label: 'AI Architecture & Model Telemetry', icon: Cpu },
  ];

  let currentLinks = farmerLinks;
  if (role === 'VETERINARIAN') currentLinks = vetLinks;
  else if (role === 'FIELD_OFFICER') currentLinks = fieldOfficerLinks;
  else if (role === 'DISTRICT_ADMIN' || role === 'STATE_ADMIN' || role === 'NATIONAL_ADMIN' || role === 'GOVERNMENT') currentLinks = govtLinks;
  else if (role === 'ADMIN') currentLinks = adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-white text-slate-700 z-50 flex flex-col border-r border-slate-200 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between lg:hidden">
          <span className="font-bold text-navy-950 text-sm">Navigation Menu</span>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-navy-950 hover:bg-slate-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace</div>
          <div className="text-sm font-bold text-blue-700 mt-0.5 truncate">
            {role === 'FARMER' && '🌾 Farmer Health Desk'}
            {role === 'VETERINARIAN' && '🩺 Veterinary Verification'}
            {role === 'FIELD_OFFICER' && '📋 Field Officer Triage'}
            {(role === 'GOVERNMENT' || role === 'DISTRICT_ADMIN') && '🏛️ District Surveillance Unit'}
            {role === 'STATE_ADMIN' && '🗺️ State Surveillance Unit'}
            {role === 'NATIONAL_ADMIN' && '🇮🇳 National Epidemiology Unit'}
            {role === 'ADMIN' && '⚡ System Administrator'}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-navy-950 active:bg-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* SIH Governance Footer */}
        <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500 bg-slate-50/90">
          <div className="flex items-center space-x-1.5 text-blue-900 font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>SIH26128 Compliance</span>
          </div>
          <p className="leading-tight text-[10px] text-slate-500">
            AI-assisted field screening. All clinical actions mandate registered veterinary verification.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
