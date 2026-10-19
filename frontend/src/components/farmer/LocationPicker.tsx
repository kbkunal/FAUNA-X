import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  village?: string;
  district?: string;
  state?: string;
  onChange: any;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude = 20.5937,
  longitude = 78.9629,
  locationName = 'Nagpur District, Maharashtra',
  village,
  district,
  state,
  onChange,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locName, setLocName] = useState(locationName || village || district || 'Field Location');

  const notifyChange = (lat: number, lng: number, name: string) => {
    setLocName(name);
    if (typeof onChange === 'function') {
      if (onChange.length >= 3) {
        onChange(lat, lng, name);
      } else {
        onChange({
          latitude: lat,
          longitude: lng,
          location_name: name,
          village: name,
          district: name,
          state: 'Maharashtra',
        });
      }
    }
  };

  const fetchGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const name = `GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
        notifyChange(pos.coords.latitude, pos.coords.longitude, name);
      },
      (err) => {
        setIsLocating(false);
        alert(`Location unavailable: ${err.message}. Please verify or enter location manually.`);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Field Geolocation (PostGIS Compatible)</div>
            <div className="text-[11px] text-slate-600">
              Coordinates: <strong className="font-mono text-blue-700">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchGPS}
          disabled={isLocating}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{isLocating ? 'Locating...' : 'Auto-Capture GPS'}</span>
        </button>
      </div>

      <div className="text-xs">
        <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
          Village / Block / District Name
        </label>
        <input
          type="text"
          value={locName}
          onChange={(e) => notifyChange(latitude, longitude, e.target.value)}
          placeholder="e.g. Haveli Village, Pune District"
          className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-slate-800"
        />
      </div>
    </div>
  );
};

export default LocationPicker;
