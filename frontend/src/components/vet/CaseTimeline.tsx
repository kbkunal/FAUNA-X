import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Stethoscope, FileText } from 'lucide-react';
import { Case } from '../../types';

interface CaseTimelineProps {
  caseDetail?: Case;
  caseItem?: Case;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ caseDetail, caseItem }) => {
  const c = caseDetail || caseItem;
  if (!c) return null;

  const preds = c.predictions || c.ai_predictions || [];
  const topPred = preds.length > 0 ? preds[0] : null;

  const events = [
    {
      title: 'Health Issue Reported',
      time: new Date(c.created_at).toLocaleString(),
      description: `Report filed by Farmer (${c.species}, ${c.number_affected} affected).`,
      completed: true,
      icon: FileText,
    },
    {
      title: 'AI Visual Screening',
      time: topPred
        ? new Date(topPred.created_at || c.created_at).toLocaleString()
        : 'Pending',
      description: topPred
        ? `Screening Output: ${topPred.prediction_class.replace('_', ' ')} (${((topPred.confidence_score || topPred.confidence || 0) * 100).toFixed(0)}% confidence).`
        : 'Awaiting image analysis.',
      completed: !!topPred,
      icon: Stethoscope,
    },
    {
      title: 'Veterinary Clinical Review',
      time: c.verification
        ? new Date(c.verification.verified_at || c.verification.created_at || c.created_at).toLocaleString()
        : 'In Progress',
      description: c.verification
        ? `Status: ${c.verification.verification_status || c.verification.status}. Notes: ${c.verification.assessment_notes || c.verification.clinical_findings || 'Standard triage complete.'}`
        : 'Assigned to veterinary medical officer.',
      completed: !!c.verification,
      icon: ShieldCheck,
    },
    {
      title: 'Early Response & Resolution',
      time: c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'Completed' : 'Pending',
      description: c.status === 'RESPONSE_ACTIVE'
        ? 'Field containment and vaccination protocols active.'
        : c.status === 'RESOLVED' || c.status === 'CLOSED'
        ? 'Case closed after field observation.'
        : 'Pending verification and outbreak classification.',
      completed: c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'RESPONSE_ACTIVE',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Case Lifecycle Timeline
        </h3>
        <span className="text-[10px] font-mono text-slate-400 font-semibold">FX-AUDIT</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((ev, idx) => {
          const Icon = ev.icon;
          return (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                  ev.completed
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className={`text-xs font-bold ${ev.completed ? 'text-navy-950' : 'text-slate-500'}`}>
                    {ev.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">{ev.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseTimeline;
