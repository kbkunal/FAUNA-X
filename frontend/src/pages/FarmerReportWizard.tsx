import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  Loader2, 
  ShieldAlert,
  Info,
  Save
} from 'lucide-react';
import AnimalImageUploader from '../components/farmer/AnimalImageUploader';
import SymptomSelector from '../components/farmer/SymptomSelector';
import VoiceRecorder from '../components/farmer/VoiceRecorder';
import LocationPicker from '../components/farmer/LocationPicker';
import { api } from '../services/api';
import { offlineDb } from '../services/offlineDb';

const STEPS = [
  { id: 1, title: 'Animal Info' },
  { id: 2, title: 'Symptoms' },
  { id: 3, title: 'Photograph' },
  { id: 4, title: 'Voice Note' },
  { id: 5, title: 'Location' },
  { id: 6, title: 'History' },
  { id: 7, title: 'Review' },
];

export default function FarmerReportWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [species, setSpecies] = useState('Cattle');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Female');
  const [numberAffected, setNumberAffected] = useState(1);

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const [latitude, setLatitude] = useState<number>(20.5937);
  const [longitude, setLongitude] = useState<number>(78.9629);
  const [locationName, setLocationName] = useState('Field Location (Nagpur District)');

  // History fields
  const [previousIllness, setPreviousIllness] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState('Unknown');
  const [recentTreatment, setRecentTreatment] = useState('');
  const [recentMovement, setRecentMovement] = useState(false);
  const [contactWithOtherAnimals, setContactWithOtherAnimals] = useState(true);
  const [recentDeaths, setRecentDeaths] = useState(0);
  const [nearbyDiseaseReports, setNearbyDiseaseReports] = useState(false);

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1 && !species) {
      setErrorMsg('Please select an animal species');
      return;
    }
    if (currentStep === 2 && symptoms.length === 0) {
      setErrorMsg('Please select at least one observed symptom');
      return;
    }
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveOffline = async () => {
    try {
      const offlinePayload = {
        species,
        breed,
        age,
        sex,
        number_affected: numberAffected,
        symptoms,
        latitude,
        longitude,
        location_name: locationName,
        history: {
          previous_illness: previousIllness,
          vaccination_status: vaccinationStatus,
          recent_treatment: recentTreatment,
          recent_movement: recentMovement,
          contact_with_other_animals: contactWithOtherAnimals,
          recent_deaths: recentDeaths,
          nearby_disease_reports: nearbyDiseaseReports,
        },
        imageBlob: selectedFile ? selectedFile : null,
      };
      await offlineDb.saveOfflineReport(offlinePayload);
      alert('Report saved offline in local storage! It will sync automatically when online.');
      navigate('/farmer/dashboard');
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to save offline report.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    // If offline, save directly to IndexedDB
    if (!navigator.onLine) {
      setSubmissionProgress('Device offline. Saving report locally...');
      await handleSaveOffline();
      setIsSubmitting(false);
      return;
    }

    try {
      setSubmissionProgress('Step 1/3: Registering case in health network...');
      const casePayload = {
        species,
        breed: breed || undefined,
        age: age || undefined,
        sex,
        number_affected: Number(numberAffected) || 1,
        symptoms,
        latitude,
        longitude,
        location_name: locationName,
        history: {
          previous_illness: previousIllness,
          vaccination_status: vaccinationStatus,
          recent_treatment: recentTreatment,
          recent_movement: recentMovement,
          contact_with_other_animals: contactWithOtherAnimals,
          recent_deaths: Number(recentDeaths) || 0,
          nearby_disease_reports: nearbyDiseaseReports,
        }
      };

      const createdCase = await api.createCase(casePayload);
      const caseId = createdCase.id;

      if (selectedFile) {
        setSubmissionProgress('Step 2/3: Uploading photograph and executing FAUNA-X AI screening...');
        await api.uploadCaseImage(caseId, selectedFile);
        setSubmissionProgress('Step 3/3: Finalizing clinical timeline and screening alerts...');
      }

      // Navigate to the case details
      navigate(`/farmer/cases/${caseId}`);
    } catch (err: any) {
      console.error('Submission failed:', err);
      const msg = err.response?.data?.detail || 'Failed to submit report. If offline, use "Save Offline Draft".';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Step Header */}
      <div className="mb-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-navy-950">Report Animal Health Issue</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Field intelligence pipeline for veterinary triage & outbreak containment
            </p>
          </div>
          <button
            onClick={handleSaveOffline}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save Offline Draft
          </button>
        </div>

        {/* Progress Bar / Pills */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 overflow-x-auto gap-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : currentStep > step.id
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                {currentStep > step.id ? '✓' : step.id}
              </span>
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900">Action Required</h4>
            <p className="text-xs text-rose-700 mt-0.5 font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Wizard Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 min-h-[420px]">
        {/* STEP 1: Animal Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Step 1: Animal Information</h2>
              <p className="text-xs text-slate-500 font-medium">Provide basic identification for the affected livestock.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Livestock Species *</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Cattle">Cattle (Cow/Bull)</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Goat">Goat</option>
                  <option value="Sheep">Sheep</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Pig">Pig</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Breed (Optional)</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Gir, Murrah, Sahiwal"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-navy-950 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Age / Stage</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 3 years, Calf, Adult"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-navy-950 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Sex</label>
                <div className="flex gap-3">
                  {['Female', 'Male'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                        sex === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Number of Animals Affected</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={numberAffected}
                    onChange={(e) => setNumberAffected(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-navy-950 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    If multiple herd members show similar symptoms, state total count.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Symptoms */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Step 2: Observed Symptoms</h2>
              <p className="text-xs text-gray-500">Select all visual or behavioral abnormalities noticed in the animal.</p>
            </div>
            <SymptomSelector selectedSymptoms={symptoms} onChange={setSymptoms} />
          </div>
        )}

        {/* STEP 3: Photograph Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Step 3: Animal Photograph</h2>
              <p className="text-xs text-gray-500">
                Upload clear images of skin lesions, mouth, feet, or body posture for AI screening.
              </p>
            </div>
            <AnimalImageUploader
              onImageSelected={(file) => setSelectedFile(file)}
              selectedFile={selectedFile}
              onImageRemoved={() => setSelectedFile(null)}
            />
            {selectedFile && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>FAUNA-X Vision screening will run automatically on this photograph upon submission.</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Voice Note */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Voice Description (Optional)</h2>
              <p className="text-xs text-slate-500 font-medium">
                Record a voice memo in local dialect explaining how the animal has been acting.
              </p>
            </div>
            <VoiceRecorder
              onVoiceRecorded={(blob, transcript) => {
                setVoiceBlob(blob);
                setVoiceTranscript(transcript);
              }}
            />
          </div>
        )}

        {/* STEP 5: Location */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 5: Incident Location</h2>
              <p className="text-xs text-slate-500 font-medium">
                Precise coordinates enable geospatial cluster tracking and veterinarian dispatch.
              </p>
            </div>
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              locationName={locationName}
              onChange={(lat, lng, name) => {
                setLatitude(lat);
                setLongitude(lng);
                setLocationName(name);
              }}
            />
          </div>
        )}

        {/* STEP 6: History */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 6: Epidemiological History</h2>
              <p className="text-xs text-slate-500 font-medium">
                Contextual history assists veterinarians in risk assessment and containment decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vaccination Status</label>
                <select
                  value={vaccinationStatus}
                  onChange={(e) => setVaccinationStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Vaccinated (Up to date)">Vaccinated (Up to date)</option>
                  <option value="Partially Vaccinated">Partially Vaccinated</option>
                  <option value="Not Vaccinated">Not Vaccinated</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recent Deaths in Herd (Last 30 Days)</label>
                <input
                  type="number"
                  min={0}
                  value={recentDeaths}
                  onChange={(e) => setRecentDeaths(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recent Treatments or Medications Given</label>
                <input
                  type="text"
                  value={recentTreatment}
                  onChange={(e) => setRecentTreatment(e.target.value)}
                  placeholder="e.g. Antibiotics 3 days ago, herbal paste applied"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={recentMovement}
                    onChange={(e) => setRecentMovement(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Recent Animal Movement / Transport</div>
                    <div className="text-[11px] text-slate-500 font-medium">Animal was brought from a market, fair, or different village recently</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={contactWithOtherAnimals}
                    onChange={(e) => setContactWithOtherAnimals(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Communal Grazing / Water Access</div>
                    <div className="text-[11px] text-slate-500 font-medium">Shared communal pastures or drinking troughs with other village herds</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={nearbyDiseaseReports}
                    onChange={(e) => setNearbyDiseaseReports(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Aware of Similar Illness in Neighboring Farms</div>
                    <div className="text-[11px] text-slate-500 font-medium">Other farmers in the vicinity reported similar blisters or fevers</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 7: Review Report & Confirm</h2>
              <p className="text-xs text-slate-500 font-medium">Verify case data before launching AI screening and veterinary dispatch.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Animal Details</span>
                <div className="text-sm font-bold text-slate-900">{species} ({sex})</div>
                <div className="text-xs text-slate-600 font-medium">Breed: {breed || 'Not specified'} | Age: {age || 'Not specified'}</div>
                <div className="text-xs text-slate-600 font-medium">Affected Count: <span className="font-bold text-blue-700">{numberAffected}</span></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location & Geo</span>
                <div className="text-sm font-bold text-slate-900">{locationName}</div>
                <div className="text-xs text-slate-600 font-mono font-medium">{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</div>
              </div>

              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symptoms Selected</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {symptoms.map((symp, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold rounded-lg">
                      {symp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attachments</span>
                <div className="flex items-center gap-4 text-xs text-slate-700 font-medium">
                  <div>
                    <span className="font-bold text-slate-800">Photograph: </span>
                    {selectedFile ? (
                      <span className="text-emerald-700 font-bold">✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    ) : (
                      <span className="text-amber-700">No image attached</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Voice Memo: </span>
                    {voiceBlob ? <span className="text-emerald-700 font-bold">✓ Recorded</span> : <span className="text-slate-400">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Warning Advisory */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-semibold">Advisory:</strong> Submitting will trigger the FAUNA-X AI Visual Screening engine. AI screening results are preliminary indicators intended to support clinical triage and do not constitute a confirmed veterinary diagnosis.
              </div>
            </div>

            {isSubmitting && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                <div className="text-xs text-blue-900 font-semibold">{submissionProgress}</div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
              currentStep === 1 || isSubmitting
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Submission...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Case & Run AI Screening
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
