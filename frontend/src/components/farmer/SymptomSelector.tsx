import React, { useState } from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { CaseSymptom } from '../../types';

const COMMON_SYMPTOMS = [
  'Skin lesions / nodules',
  'Fever / high temperature',
  'Loss of appetite',
  'Salivation / frothing',
  'Lameness / limping',
  'Reduced milk yield',
  'Nasal discharge',
  'Coughing / breathing difficulty',
  'Udder swelling / mastitis',
  'Diarrhea',
  'Weakness / recumbency',
  'Eye discharge / lacrimation',
];

interface SymptomSelectorProps {
  selectedSymptoms?: string[];
  symptoms?: (string | CaseSymptom)[];
  onChange: (symptoms: any) => void;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({ 
  selectedSymptoms, 
  symptoms = [], 
  onChange 
}) => {
  const [customInput, setCustomInput] = useState('');

  // Normalize current items to string array
  const currentList: string[] = selectedSymptoms 
    ? selectedSymptoms 
    : symptoms.map(s => typeof s === 'string' ? s : s.symptom_name);

  const isSelected = (name: string) => 
    currentList.some((s) => s.toLowerCase() === name.toLowerCase());

  const toggleSymptom = (name: string) => {
    if (isSelected(name)) {
      const updated = currentList.filter((s) => s.toLowerCase() !== name.toLowerCase());
      onChange(updated);
    } else {
      const updated = [...currentList, name];
      onChange(updated);
    }
  };

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!isSelected(customInput.trim())) {
      const updated = [...currentList, customInput.trim()];
      onChange(updated);
    }
    setCustomInput('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {COMMON_SYMPTOMS.map((sym) => {
          const active = isSelected(sym);
          return (
            <button
              key={sym}
              type="button"
              onClick={() => toggleSymptom(sym)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                active
                  ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="truncate pr-1">{sym}</span>
              {active && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Add Custom Symptom */}
      <form onSubmit={addCustom} className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add other observed symptom..."
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};

export default SymptomSelector;
