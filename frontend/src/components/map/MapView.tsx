import React, { useState } from 'react';
import { MapPin, Layers, Filter } from 'lucide-react';
import { MapCasePoint, MapCaseFeature } from '../../types';

interface MapViewProps {
  cases?: MapCasePoint[];
  features?: MapCaseFeature[];
  height?: string;
  onSelectCase?: (caseId: number) => void;
  selectedCaseId?: number | null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  cases = [], 
  features = [], 
  height = '500px', 
  onSelectCase, 
  selectedCaseId 
}) => {
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Normalize points from either cases array or GeoJSON features array
  const rawPoints = cases.length > 0 
    ? cases 
    : features.map(f => ({
        id: f.properties.id,
        case_number: f.properties.case_number,
        species: f.properties.species,
        status: f.properties.status,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        village: f.properties.location_name,
        district: f.properties.location_name,
        top_prediction: f.properties.top_prediction,
        confidence: f.properties.confidence,
        created_at: f.properties.created_at,
      }));

  const filteredCases = rawPoints.filter((c) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'VERIFIED') return c.status === 'VERIFIED';
    if (statusFilter === 'PENDING') return ['SUBMITTED', 'AI_SCREENING', 'AI_SCREENED', 'UNDER_REVIEW', 'VETERINARY_REVIEW'].includes(c.status);
    if (statusFilter === 'ACTIVE') return c.status === 'RESPONSE_ACTIVE';
    return true;
  });

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-500 border-emerald-300 text-white';
      case 'RESPONSE_ACTIVE':
        return 'bg-rose-500 border-rose-300 text-white';
      case 'VETERINARY_REVIEW':
      case 'UNDER_REVIEW':
      case 'AI_SCREENING':
      case 'AI_SCREENED':
      case 'SUBMITTED':
        return 'bg-amber-500 border-amber-300 text-white';
      default:
        return 'bg-slate-500 border-slate-300 text-white';
    }
  };

  return (
    <div 
      style={{ height }}
      className="relative w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-card flex flex-col"
    >
      {/* Map Header Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-800 text-xs shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900">
            Epidemiological Surveillance GIS ({filteredCases.length} mapped points)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">All Case Statuses</option>
            <option value="VERIFIED">Clinically Verified</option>
            <option value="PENDING">Pending Verification</option>
            <option value="ACTIVE">Active Response</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
        {/* Background Grid Lines simulating Map Coordinate Canvas */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        {/* State Boundaries Silhouette Simulation */}
        <div className="absolute inset-8 border border-blue-500/20 rounded-3xl bg-slate-900/50 backdrop-blur-sm pointer-events-none">
          <div className="absolute top-4 left-6 text-[10px] uppercase font-mono text-blue-400 tracking-widest font-bold">
            Western Maharashtra Surveillance Sector [18.52 N, 73.85 E]
          </div>
        </div>

        {/* Mapped Points on relative coordinates */}
        {filteredCases.map((c) => {
          // Normalized mapping for Indian coordinates
          const lat = c.latitude || 20.59;
          const lon = c.longitude || 78.96;
          const normLat = Math.max(0.1, Math.min(0.9, (lat - 16.0) / 10.0));
          const normLon = Math.max(0.1, Math.min(0.9, (lon - 72.0) / 14.0));
          
          const topPct = (1 - normLat) * 75 + 12;
          const leftPct = normLon * 75 + 12;

          const isSelected = selectedPoint?.id === c.id || selectedCaseId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => {
                setSelectedPoint(c);
                if (onSelectCase) onSelectCase(c.id);
              }}
              style={{ top: `${topPct}%`, left: `${leftPct}%` }}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all group ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg ${getMarkerColor(
                  c.status
                )} ${isSelected ? 'ring-4 ring-blue-400/70' : ''}`}
              >
                <MapPin className="w-3.5 h-3.5" />
              </div>

              {/* Pin Tooltip */}
              <div className="absolute left-1/2 bottom-8 -translate-x-1/2 hidden group-hover:block bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap border border-slate-200 pointer-events-none">
                {c.case_number} ({c.species})
              </div>
            </div>
          );
        })}

        {/* Selected Case Detail Modal Drawer on Map */}
        {selectedPoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-4 text-slate-900 z-40 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-bold text-blue-600 text-xs">{selectedPoint.case_number}</span>
                <span className="text-[10px] text-slate-500 font-medium">({selectedPoint.species})</span>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-1 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">
                  {selectedPoint.village || selectedPoint.district || 'Field Area'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">{selectedPoint.status}</span>
              </div>
              {selectedPoint.top_prediction && (
                <div className="flex justify-between">
                  <span className="text-slate-500">AI Screening:</span>
                  <span className="font-bold text-blue-700">
                    {selectedPoint.top_prediction} ({(selectedPoint.confidence || 0) * 100}%)
                  </span>
                </div>
              )}
            </div>

            {onSelectCase && (
              <button
                onClick={() => onSelectCase(selectedPoint.id)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-all"
              >
                Open Complete Case File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-white border-t border-slate-200 p-2.5 px-4 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span className="font-medium">Clinically Verified</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
            <span className="font-medium">Pending Review</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></span>
            <span className="font-medium">Active Response</span>
          </div>
        </div>
        <span className="text-[10px] text-blue-600 font-mono font-semibold">PostGIS Integration Active</span>
      </div>
    </div>
  );
};

export default MapView;
