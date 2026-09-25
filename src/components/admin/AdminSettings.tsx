import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, RefreshCw, Shield, MapPin, Database, Check } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { t, showToast, resetAllDemoData } = useApp();
  const [geofencePolicy, setGeofencePolicy] = useState<'allow_exception' | 'strict_block'>('allow_exception');
  const [lateCutoff, setLateCutoff] = useState('08:30');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleSavePolicy = () => {
    showToast('System configuration settings saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navSettings}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional attendance rules, threshold cutoff times, geofencing enforcement, and test data management.
        </p>
      </div>

      {/* Geofencing Policy Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Geofencing & Boundary Verification Rules</h3>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Define system behavior when a student initiates check-in outside the authorized campus or hospital radius:
          </p>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="geofencePolicy"
                checked={geofencePolicy === 'allow_exception'}
                onChange={() => setGeofencePolicy('allow_exception')}
                className="mt-0.5 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-900 block">
                  Permit Check-in with Administrative Exception Flag (Recommended)
                </span>
                <span className="text-slate-500 text-[11px] leading-relaxed block mt-0.5">
                  Allows student to register check-in, captures their exact GPS coordinates, displays a clear warning, and immediately generates a compliance alert for admin review.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="geofencePolicy"
                checked={geofencePolicy === 'strict_block'}
                onChange={() => setGeofencePolicy('strict_block')}
                className="mt-0.5 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-900 block">Strict Enforcement (Block Sign-In)</span>
                <span className="text-slate-500 text-[11px] leading-relaxed block mt-0.5">
                  Prevents student check-in entirely if device coordinates exceed the allowed geofence perimeter.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSavePolicy}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
          >
            Save Boundary Policy
          </button>
        </div>
      </div>

      {/* Arrival Time Cutoff Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Attendance Cutoff & Punctuality Standards</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standard Arrival Cutoff Time</label>
            <input
              type="time"
              value={lateCutoff}
              onChange={e => setLateCutoff(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white text-xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Sign-ins registered after this hour will be classified as <strong>Late</strong> automatically.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location Capture Protocol</label>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
              ✓ Only captures device coordinates upon <strong>Sign-In</strong> and <strong>Sign-Out</strong>.
              <br />
              ✓ Continuous background tracking is strictly disabled for student privacy compliance.
            </div>
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-sm">Demo Data & Storage Reset</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Restore the initial database state (10 sample medical & clinical students, 30 days of attendance trends, sample approved/pending leave requests, and training locations).
        </p>

        <div>
          {confirmResetOpen ? (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs">
              <span className="font-semibold text-rose-800">{t.resetDemoDataConfirm}</span>
              <button
                onClick={() => {
                  resetAllDemoData();
                  setConfirmResetOpen(false);
                }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
              >
                Yes, Reset Now
              </button>
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.resetDemoData}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
