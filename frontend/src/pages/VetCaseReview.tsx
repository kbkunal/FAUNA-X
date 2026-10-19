import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Loader2, 
  AlertCircle,
  Stethoscope,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Case } from '../types';
import AIResultCard from '../components/ai/AIResultCard';
import CaseTimeline from '../components/vet/CaseTimeline';
import VerificationPanel from '../components/vet/VerificationPanel';
import RiskBadge from '../components/common/RiskBadge';

export default function VetCaseReview() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchCase = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const data = await api.getCaseById(caseId);
      setCaseData(data);
    } catch (err: any) {
      console.error('Error fetching case:', err);
      setError(err.response?.data?.detail || 'Failed to load case record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [caseId]);

  const handleVerified = (verification: any) => {
    setSuccessBanner('Clinical diagnosis recorded successfully in the national surveillance database.');
    fetchCase(); // Refresh case state
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-navy-900 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading clinical case file...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-navy-950 mb-1">Case Record Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">{error || 'The requested case file is inaccessible.'}</p>
        <Link
          to="/vet/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-xl hover:bg-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Triage Worklist
        </Link>
      </div>
    );
  }

  const primaryImage = caseData.images && caseData.images.length > 0 ? caseData.images[0] : null;
  const primaryPrediction = (caseData.ai_predictions && caseData.ai_predictions.length > 0)
    ? caseData.ai_predictions[0]
    : (caseData.predictions && caseData.predictions.length > 0 ? caseData.predictions[0] : null);

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/?(uploads\/)?/, '');
    if (!cleanPath.startsWith('cases/')) {
      return `http://localhost:8000/uploads/cases/${cleanPath}`;
    }
    return `http://localhost:8000/uploads/${cleanPath}`;
  };

  const imageUrl = primaryImage ? getImageUrl(primaryImage.storage_path) : undefined;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-card">
        <div>
          <button
            onClick={() => navigate('/vet/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Triage Worklist
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-navy-950 font-mono tracking-tight">
              Clinical Review: {caseData.case_number}
            </h1>
            <RiskBadge status={caseData.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered on {new Date(caseData.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        {caseData.verification && (
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Current Status: {caseData.verification.verification_status}
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Screening Card, Clinical Profile, Verification Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Result Card */}
          <AIResultCard
            prediction={primaryPrediction}
            imageUrl={imageUrl}
          />

          {/* Clinical Profile & Symptoms */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Patient & Epidemiological Data
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Species</span>
                <p className="text-sm font-bold text-navy-950 mt-0.5">{caseData.species}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sex / Age</span>
                <p className="text-sm font-bold text-navy-950 mt-0.5">{caseData.sex || 'Unknown'} • {caseData.age || 'N/A'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Breed</span>
                <p className="text-sm font-bold text-navy-950 mt-0.5">{caseData.breed || 'Indigen / Mixed'}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Affected Count</span>
                <p className="text-sm font-bold text-rose-600 mt-0.5">{caseData.number_affected} animal(s)</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-navy-950 block mb-2">Farmer Reported Symptoms:</span>
              <div className="flex flex-wrap gap-2">
                {caseData.symptoms && caseData.symptoms.length > 0 ? (
                  caseData.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl"
                    >
                      {s.symptom_name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No symptoms specified</span>
                )}
              </div>
            </div>

            {/* Epidemiological Context */}
            {caseData.history && (
              <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
                <span className="font-bold text-navy-950 block">Epidemiological Risk Indicators:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-medium">
                  <div>• Vaccination: <strong className="text-navy-950">{caseData.history.vaccination_status || 'Unknown'}</strong></div>
                  <div>• Herd Deaths (30d): <strong className="text-navy-950">{caseData.history.recent_deaths ?? 0}</strong></div>
                  <div>• Transport / Market History: <strong className="text-navy-950">{caseData.history.recent_movement ? 'Yes' : 'No'}</strong></div>
                  <div>• Shared Communal Grazing: <strong className="text-navy-950">{caseData.history.contact_with_other_animals ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Verification Panel */}
          <VerificationPanel
            caseId={caseData.id}
            initialStatus={caseData.status}
            onVerified={handleVerified}
          />
        </div>

        {/* Right Col: Geographic Location & Lifecycle Timeline */}
        <div className="space-y-6">
          {/* Location Details */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Incident Coordinates & Jurisdiction
            </h3>
            <div>
              <p className="text-sm font-bold text-navy-950">{caseData.location_name || 'Field Location'}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {caseData.latitude.toFixed(4)}° N, {caseData.longitude.toFixed(4)}° E
              </p>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-2xl text-xs text-slate-600 leading-relaxed border border-blue-100 font-medium">
              Assigned Veterinary Dispensary: <strong className="text-blue-950">Nagpur Central Animal Health Center</strong>
            </div>
          </div>

          {/* Case Lifecycle Timeline */}
          <CaseTimeline caseItem={caseData} />
        </div>
      </div>
    </div>
  );
}
