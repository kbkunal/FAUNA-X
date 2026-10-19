import React, { useState } from 'react';
import { Mic, Square, Trash2, Volume2, Info } from 'lucide-react';

interface VoiceRecorderProps {
  onVoiceRecorded?: (blob: Blob, transcript: string) => void;
  onAudioRecorded?: (blob: Blob) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceRecorded, onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [duration, setDuration] = useState(0);

  const startRecord = () => {
    setIsRecording(true);
    setHasAudio(false);
    setDuration(0);
    const interval = setInterval(() => {
      setDuration((prev) => {
        if (prev >= 20) {
          clearInterval(interval);
          setIsRecording(false);
          setHasAudio(true);
          const dummyBlob = new Blob(['sample-voice-data'], { type: 'audio/webm' });
          if (onVoiceRecorded) onVoiceRecorded(dummyBlob, 'Animal is exhibiting sluggishness and fever.');
          if (onAudioRecorded) onAudioRecorded(dummyBlob);
          return 20;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecord = () => {
    setIsRecording(false);
    setHasAudio(true);
    const dummyBlob = new Blob(['sample-voice-data'], { type: 'audio/webm' });
    if (onVoiceRecorded) onVoiceRecorded(dummyBlob, 'Animal is exhibiting sluggishness and fever.');
    if (onAudioRecorded) onAudioRecorded(dummyBlob);
  };

  const deleteAudio = () => {
    setIsRecording(false);
    setHasAudio(false);
    setDuration(0);
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Voice Note Support: </span>
          Farmers can record up to 20 seconds describing symptoms in local dialect. Future AI modules will transcribe speech to clinical terms.
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-1">
        {!isRecording && !hasAudio && (
          <button
            type="button"
            onClick={startRecord}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Record Voice Note</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecord}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold animate-pulse shadow-sm"
          >
            <Square className="w-4 h-4" />
            <span>Stop ({duration}s / 20s)</span>
          </button>
        )}

        {hasAudio && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Voice Note Recorded ({duration}s)</span>
            </div>
            <button
              type="button"
              onClick={deleteAudio}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-colors"
              title="Delete audio"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
