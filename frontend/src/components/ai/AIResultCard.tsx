import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Cpu, Info, Activity, Image as ImageIcon } from 'lucide-react';
import { AIPrediction } from '../../types';

interface AIResultCardProps {
  prediction?: AIPrediction | null;
  imageUrl?: string;
}

export const AIResultCard: React.FC<AIResultCardProps> = ({ prediction, imageUrl }) => {
  if (!prediction) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {/* AI Card Header */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-navy-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-slate-200 border border-white/10">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white">
                FAUNA-X AI VISUAL SCREENING
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                Model: YOLO11n-cls Edge Vision Engine
              </div>
            </div>
          </div>

          <span className="text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs bg-slate-100 text-slate-700 border-slate-300">
            Screening Pending
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {imageUrl ? (
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={imageUrl}
                alt="Case attachment"
                className="w-36 h-36 object-cover rounded-xl border border-slate-300 shadow-xs"
              />
              <div className="space-y-2 text-center sm:text-left">
                <div className="text-sm font-bold text-navy-950">
                  Image Attached — Awaiting AI Screening
                </div>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  The clinical image is stored in the system. The automated PyTorch vision screening model will process this image or a veterinary officer will conduct manual verification.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Image Uploaded</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No visual photograph was uploaded for this case report. AI visual screening requires an animal photo showing affected areas.
              </p>
            </div>
          )}

          {/* Mandatory Clinical Disclaimer & Warning */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-950">
                CLINICAL TRIAGE NOTICE
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                AI visual screening is an auxiliary syndromic indicator tool designed to accelerate response. Physical diagnosis, lab confirmatory tests, and quarantine mandates remain with licensed veterinary officers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isHealthy = prediction.prediction_class === 'healthy';
  const confidenceScore = prediction.percentage ?? (prediction.confidence != null ? Math.round(prediction.confidence * 100) : 0);
  const isLowConf = prediction.is_low_confidence || confidenceScore < 65;

  const cardBorder = isHealthy
    ? 'border-emerald-200'
    : isLowConf
    ? 'border-amber-200'
    : 'border-blue-200';

  const badgeColor = isHealthy
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isLowConf
    ? 'bg-amber-50 text-amber-800 border-amber-300'
    : 'bg-blue-50 text-blue-700 border-blue-200';

  const displayName = prediction.display_name || prediction.prediction_class?.replace(/_/g, ' ') || 'Screening Result';

  return (
    <div className={`rounded-3xl border ${cardBorder} bg-white shadow-card overflow-hidden`}>
      {/* AI Card Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-navy-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-blue-200 border border-white/10">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white">
              FAUNA-X AI VISUAL SCREENING
            </div>
            <div className="text-[10px] text-blue-200 font-mono">
              Model: {prediction.model_name || 'YOLO11n-cls'} (v{prediction.model_version || '1.0'})
            </div>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs ${badgeColor}`}>
          {isHealthy ? 'No Visible Abnormality' : isLowConf ? 'Low-Confidence Flag' : 'Potential Indicator'}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Main Screening Result & Image Preview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-blue-50/40 border border-blue-100">
          <div className="flex items-center gap-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Analyzed livestock"
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-blue-200 shadow-xs flex-shrink-0"
              />
            )}
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-blue-700">
                Visual Screening Output
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight mt-0.5 capitalize">
                {displayName}
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {prediction.status_text || (isHealthy ? 'Animal shows no visible disease lesions' : 'Visual symptoms detected matching disease model')}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs text-center sm:text-right flex-shrink-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Model Confidence
            </div>
            <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">
              {confidenceScore}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHealthy ? 'bg-emerald-500' : isLowConf ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, confidenceScore))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alternative Model Probability Distribution */}
        {prediction.alternatives && prediction.alternatives.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-2.5 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Comparative Class Probabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {prediction.alternatives.map((alt) => (
                <div
                  key={alt.class}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs hover:border-blue-200 transition-colors"
                >
                  <span className="font-semibold text-slate-800">{alt.display_name}</span>
                  <span className="font-mono font-bold text-blue-700">{alt.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detected Visual Indicators */}
        {prediction.visual_indicators && prediction.visual_indicators.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-2.5">
              Extracted Visual Indicators
            </h4>
            <div className="space-y-2">
              {prediction.visual_indicators.map((ind, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 flex items-start space-x-3 text-xs"
                >
                  <div className="p-1 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-navy-950">{ind.name}</div>
                    <div className="text-slate-600 mt-0.5 font-medium">{ind.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Quality Audit */}
        {prediction.image_quality && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-600 font-medium">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>
                Input: {prediction.image_quality.width}x{prediction.image_quality.height} px
              </span>
              <span className="text-slate-300">|</span>
              <span>Sharpness: {prediction.image_quality.sharpness_score}</span>
            </div>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                prediction.image_quality.quality_level === 'GOOD'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              Quality: {prediction.image_quality.quality_level}
            </span>
          </div>
        )}

        {/* Mandatory Clinical Disclaimer & Warning */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-950">
              MANDATORY VETERINARY VERIFICATION NOTICE
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              This screening result is generated by an AI computer vision model for preliminary syndromic triage.
              <strong> It does not constitute a veterinary diagnosis.</strong> Model confidence is not equivalent to diagnostic certainty. All treatment and containment actions mandate in-person veterinary verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResultCard;
