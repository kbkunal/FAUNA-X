import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Activity, Clock, CheckCircle, ShieldAlert, ArrowRight, Smartphone, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getPendingOfflineReports } from '../services/offlineDb';
import { CaseDetail } from '../types';
import { StatCard } from '../components/common/StatCard';
import { CaseStatusBadge, LoadingState, EmptyState } from '../components/common/RiskBadge';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOffline, setPendingOffline] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCases();
        setCases(data);
        const offline = await getPendingOfflineReports();
        setPendingOffline(offline.length);
      } catch (e) {
        console.error('Failed to load farmer cases', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const underReview = cases.filter((c) =>
    ['SUBMITTED', 'AI_SCREENING', 'VETERINARY_REVIEW'].includes(c.status)
  ).length;
  const verifiedCount = cases.filter((c) => c.status === 'VERIFIED' || c.status === 'RESPONSE_ACTIVE').length;
  const resolvedCount = cases.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6 pb-16 lg:pb-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-card">
        <div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Farmer Health Desk
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight mt-0.5">
            Namaste, {user?.full_name || 'Farmer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Village: {user?.district || 'Pune'}, {user?.state || 'Maharashtra'} | Herd Monitoring Active
          </p>
        </div>

        <Link
          to="/farmer/report"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Report Animal Health Issue</span>
        </Link>
      </div>

      {/* Offline Pending Banner */}
      {pendingOffline > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>{pendingOffline} report(s)</strong> stored offline on this device. They will automatically sync when network is restored.
            </span>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Cases Filed" value={cases.length} icon={Activity} color="blue" />
        <StatCard title="Under Vet Review" value={underReview} icon={Clock} color="amber" />
        <StatCard title="Clinically Verified" value={verifiedCount} icon={ShieldAlert} color="rose" />
        <StatCard title="Resolved Cases" value={resolvedCount} icon={CheckCircle} color="emerald" />
      </div>

      {/* Recent Health Cases */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
            Your Reported Animal Cases
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{cases.length} records</span>
        </div>

        {loading ? (
          <LoadingState message="Fetching your herd health records..." />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No Animal Health Issues Reported"
            description="Your registered animals currently have no open disease alerts."
            action={
              <Link
                to="/farmer/report"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
              >
                File First Health Report
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {cases.map((c) => {
              const topAI = c.ai_predictions?.[0];
              return (
                <Link
                  key={c.id}
                  to={`/farmer/cases/${c.id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-blue-50/30 transition-colors group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-navy-950 group-hover:text-blue-700">
                        {c.case_number}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {c.species} {c.breed ? `(${c.breed})` : ''}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {topAI ? (
                        <span className="text-[11px] font-medium text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          AI Screening: {topAI.display_name} ({topAI.percentage}%)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Awaiting visual screening</span>
                      )}

                      {c.symptoms.length > 0 && (
                        <span className="text-[11px] text-slate-500">
                          Symptoms: {c.symptoms.map((s) => s.symptom_name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <CaseStatusBadge status={c.status} />
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
