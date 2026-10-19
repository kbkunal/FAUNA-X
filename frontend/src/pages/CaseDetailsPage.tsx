import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  Activity, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Case } from '../types';
import AIResultCard from '../components/ai/AIResultCard';
import CaseTimeline from '../components/vet/CaseTimeline';
import RiskBadge from '../components/common/RiskBadge';

export default function CaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;
    const fetchCase = async () => {
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
    fetchCase();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-navy-900 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Retrieving case record & screening logs...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-navy-950 mb-1">Case Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">{error || 'The requested livestock case could not be located.'}</p>
        <Link
          to="/farmer/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-xl hover:bg-navy-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Find latest image and prediction
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
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-card">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-navy-950 font-mono tracking-tight">
              {caseData.case_number}
            </h1>
            <RiskBadge status={caseData.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered on {new Date(caseData.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {caseData.verification && (
            <div className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
              caseData.verification.verification_status === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Vet Status: {caseData.verification.verification_status}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Screening Card & Clinical Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Result Card */}
          <AIResultCard
            prediction={primaryPrediction}
            imageUrl={imageUrl}
          />

          {/* Animal Details & Clinical Profile */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Clinical Profile & Observed Symptoms
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Number Affected</span>
                <p className="text-sm font-bold text-rose-600 mt-0.5">{caseData.number_affected} animal(s)</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-navy-950 block mb-2">Reported Symptoms:</span>
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
                  <span className="text-xs text-slate-400 italic">No symptoms recorded</span>
                )}
              </div>
            </div>

            {/* History Details */}
            {caseData.history && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-navy-950 block">Epidemiological Context:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-medium">
                  <div>• Vaccination: <strong className="text-navy-950">{caseData.history.vaccination_status || 'Unknown'}</strong></div>
                  <div>• Herd Deaths (30d): <strong className="text-navy-950">{caseData.history.recent_deaths ?? 0}</strong></div>
                  <div>• Recent Movement: <strong className="text-navy-950">{caseData.history.recent_movement ? 'Yes' : 'No'}</strong></div>
                  <div>• Shared Grazing: <strong className="text-navy-950">{caseData.history.contact_with_other_animals ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Veterinarian Clinical Notes (if verified) */}
          {caseData.verification && (
            <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Veterinary Verification Report
                </h3>
                <span className="text-xs font-mono text-emerald-800 font-semibold">
                  {new Date(caseData.verification.verified_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {caseData.verification.assessment_notes || 'No assessment notes provided.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-bold">
                {caseData.verification.sample_required && (
                  <span className="px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">Sample Required</span>
                )}
                {caseData.verification.containment_required && (
                  <span className="px-2.5 py-0.5 bg-rose-200 text-rose-900 rounded-full">Containment Active</span>
                )}
                {caseData.verification.treatment_prescribed && (
                  <span className="px-2.5 py-0.5 bg-blue-200 text-blue-900 rounded-full">Treatment Prescribed</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Timeline & Location Card */}
        <div className="space-y-6">
          {/* Location Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Incident Coordinates
            </h3>
            <div>
              <p className="text-sm font-bold text-navy-950">{caseData.location_name || 'Field Coordinates'}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5 font-medium">
                {caseData.latitude.toFixed(4)}° N, {caseData.longitude.toFixed(4)}° E
              </p>
            </div>
          </div>

          {/* Lifecycle Timeline */}
          <CaseTimeline caseItem={caseData} />
        </div>
      </div>
    </div>
  );
}
