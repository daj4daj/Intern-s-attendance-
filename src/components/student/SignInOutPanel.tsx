import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage, calculateDistanceMeters } from '../../services/storage';
import { AttendanceRecord, LocationSite } from '../../types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Compass,
  Laptop,
  Check,
  LogOut,
  LogIn,
  RotateCcw
} from 'lucide-react';

export const SignInOutPanel: React.FC = () => {
  const { currentStudent, showToast, refreshData, t } = useApp();

  const [activeSession, setActiveSession] = useState<AttendanceRecord | undefined>(() =>
    currentStudent ? storage.getActiveSession(currentStudent.studentId) : undefined
  );

  const [locations] = useState<LocationSite[]>(() => storage.getLocations().filter(l => l.status === 'active'));
  const [selectedLocation, setSelectedLocation] = useState<LocationSite>(locations[0] || {
    id: 'loc-1',
    locationName: 'Main Training Hospital',
    latitude: 24.7136,
    longitude: 46.6753,
    allowedRadiusMeters: 150,
    address: 'Clinical Ward 3',
    status: 'active',
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [distanceToSite, setDistanceToSite] = useState<number | null>(null);
  const [isOutsideBoundary, setIsOutsideBoundary] = useState(false);
  const [simulatedLocationMode, setSimulatedLocationMode] = useState<'real' | 'at_hospital' | 'far_away'>('at_hospital');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check active session on load & refresh
  useEffect(() => {
    if (currentStudent) {
      const active = storage.getActiveSession(currentStudent.studentId);
      setActiveSession(active);
    }
  }, [currentStudent]);

  // Live timer for active session
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(activeSession.signInTime).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Handle location coordinates based on mode
  useEffect(() => {
    if (simulatedLocationMode === 'at_hospital') {
      // Set coordinates exactly at the selected training site (within boundary)
      const lat = selectedLocation.latitude + 0.0001; // ~11 meters offset
      const lng = selectedLocation.longitude + 0.0001;
      setUserCoords({ lat, lng, accuracy: 12 });
      const dist = calculateDistanceMeters(lat, lng, selectedLocation.latitude, selectedLocation.longitude);
      setDistanceToSite(dist);
      setIsOutsideBoundary(dist > selectedLocation.allowedRadiusMeters);
    } else if (simulatedLocationMode === 'far_away') {
      // Simulate student checking in from home / outside perimeter (~850m away)
      const lat = selectedLocation.latitude + 0.0075;
      const lng = selectedLocation.longitude + 0.0055;
      setUserCoords({ lat, lng, accuracy: 25 });
      const dist = calculateDistanceMeters(lat, lng, selectedLocation.latitude, selectedLocation.longitude);
      setDistanceToSite(dist);
      setIsOutsideBoundary(dist > selectedLocation.allowedRadiusMeters);
    }
  }, [simulatedLocationMode, selectedLocation]);

  // Request real device GPS
  const acquireDeviceGPS = () => {
    if (!navigator.geolocation) {
      showToast(t.gpsError, 'error');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng, accuracy: Math.round(pos.coords.accuracy) });
        const dist = calculateDistanceMeters(lat, lng, selectedLocation.latitude, selectedLocation.longitude);
        setDistanceToSite(dist);
        setIsOutsideBoundary(dist > selectedLocation.allowedRadiusMeters);
        setSimulatedLocationMode('real');
        showToast('Device GPS coordinates obtained successfully.', 'success');
      },
      err => {
        setGpsLoading(false);
        showToast(`${t.gpsError} (${err.message})`, 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSignIn = () => {
    if (!currentStudent) return;

    const lat = userCoords?.lat || selectedLocation.latitude;
    const lng = userCoords?.lng || selectedLocation.longitude;
    const locName = `${selectedLocation.locationName} (${selectedLocation.address})`;

    const result = storage.recordSignIn({
      studentId: currentStudent.studentId,
      latitude: lat,
      longitude: lng,
      locationName: locName,
      isOutsideGeofence: isOutsideBoundary,
      deviceInfo: `${navigator.platform} · ${navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser'}`,
    });

    if (result.success && result.record) {
      setActiveSession(result.record);
      showToast(`${t.signedInSuccess} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'success');
      refreshData();
    } else {
      showToast(result.error || 'Failed to sign in', 'error');
    }
  };

  const handleSignOut = () => {
    if (!currentStudent) return;

    const lat = userCoords?.lat || selectedLocation.latitude;
    const lng = userCoords?.lng || selectedLocation.longitude;
    const locName = `${selectedLocation.locationName} (Exit)`;

    const result = storage.recordSignOut({
      studentId: currentStudent.studentId,
      latitude: lat,
      longitude: lng,
      locationName: locName,
    });

    if (result.success && result.record) {
      setActiveSession(undefined);
      const mins = result.record.durationMinutes || 0;
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      showToast(
        `${t.signedOutSuccess} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total duration: ${hours}h ${remainingMins}m`,
        'success'
      );
      refreshData();
    } else {
      showToast(result.error || 'Failed to sign out', 'error');
    }
  };

  const formatElapsed = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please select a student user to view the attendance check-in portal.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navSignInOut}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Student geolocation check-in portal for authorized training sites and clinical rotations.
        </p>
      </div>

      {/* Main Status & Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-center">
        {/* Sign-in state header */}
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
              activeSession
                ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50'
                : 'bg-indigo-100 text-indigo-600 ring-8 ring-indigo-50'
            }`}
          >
            {activeSession ? <Clock className="w-8 h-8 animate-pulse" /> : <Compass className="w-8 h-8" />}
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {activeSession ? 'Session Currently In Progress' : 'Ready to Check In'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {activeSession
              ? `Signed in today at ${new Date(activeSession.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at ${activeSession.signInLocationName}`
              : `Select your assigned training site below and verify your geographic location to register attendance.`}
          </p>
        </div>

        {/* Live Active Clock (if signed in) */}
        {activeSession && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl inline-block px-8">
            <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold block mb-1">
              {t.activeSessionDuration}
            </span>
            <span className="text-4xl font-mono font-bold text-emerald-950 tracking-tight">
              {formatElapsed(elapsedSeconds)}
            </span>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Shift active · Recording verified</span>
            </div>
          </div>
        )}

        {/* Geofencing Verification Box */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-left text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>{t.geofenceStatus}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={acquireDeviceGPS}
                disabled={gpsLoading}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>{gpsLoading ? 'Acquiring GPS...' : 'Get Live GPS'}</span>
              </button>
            </div>
          </div>

          {/* Assigned Location dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">{t.nearestLocation}</label>
              <select
                disabled={!!activeSession}
                value={selectedLocation.id}
                onChange={e => {
                  const loc = locations.find(l => l.id === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.locationName}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Simulation Controls */}
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">GPS Test Simulator Mode</label>
              <select
                value={simulatedLocationMode}
                onChange={e => setSimulatedLocationMode(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden"
              >
                <option value="at_hospital">Inside Boundary (~11m from Site)</option>
                <option value="far_away">Outside Boundary (~850m away - Exception Test)</option>
                <option value="real">Real Device GPS</option>
              </select>
            </div>
          </div>

          {/* Distance and boundary readout */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block font-mono">Distance to Site</span>
              <span className="font-mono font-bold text-slate-800">
                {distanceToSite !== null ? `${distanceToSite} meters` : 'Calculating...'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-mono">Allowed Radius</span>
              <span className="font-mono font-bold text-slate-800">{selectedLocation.allowedRadiusMeters} meters</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 block font-mono">Boundary State</span>
              {isOutsideBoundary ? (
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Outside Radius
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Within Boundary
                </span>
              )}
            </div>
          </div>

          {/* Outside Boundary Warning Note */}
          {isOutsideBoundary && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
              <strong>{t.warningOutsideGeofence}</strong> {t.exceptionAllowed}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          {activeSession ? (
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto min-w-[260px] px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.actionSignOut}</span>
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full sm:w-auto min-w-[260px] px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <LogIn className="w-5 h-5" />
              <span>{t.actionSignIn}</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Location is verified exclusively at sign-in/sign-out and never tracked continuously.
        </div>
      </div>
    </div>
  );
};
