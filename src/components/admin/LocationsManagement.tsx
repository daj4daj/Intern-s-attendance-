import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { LocationSite } from '../../types';
import { MapPin, Plus, Navigation, Edit2, Trash2, X, Check, Globe } from 'lucide-react';

export const LocationsManagement: React.FC = () => {
  const { t, showToast, refreshData, currentUser } = useApp();
  const [locations, setLocations] = useState<LocationSite[]>(() => storage.getLocations());
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationSite | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState(24.7136);
  const [formLng, setFormLng] = useState(46.6753);
  const [formRadius, setFormRadius] = useState(150);
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [detectingGps, setDetectingGps] = useState(false);

  const reload = () => {
    setLocations(storage.getLocations());
    refreshData();
  };

  const openAdd = () => {
    setEditingLoc(null);
    setFormName('');
    setFormLat(24.7136);
    setFormLng(46.6753);
    setFormRadius(150);
    setFormAddress('');
    setFormStatus('active');
    setIsAddEditOpen(true);
  };

  const openEdit = (loc: LocationSite) => {
    setEditingLoc(loc);
    setFormName(loc.locationName);
    setFormLat(loc.latitude);
    setFormLng(loc.longitude);
    setFormRadius(loc.allowedRadiusMeters);
    setFormAddress(loc.address);
    setFormStatus(loc.status);
    setIsAddEditOpen(true);
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setDetectingGps(false);
        setFormLat(Number(pos.coords.latitude.toFixed(6)));
        setFormLng(Number(pos.coords.longitude.toFixed(6)));
        if (!formName) setFormName('Current Testing Campus');
        if (!formAddress) setFormAddress('Live Geolocation Preset');
        showToast('Acquired current GPS coordinates!', 'success');
      },
      err => {
        setDetectingGps(false);
        showToast(`Could not acquire GPS: ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Location name is required.', 'error');
      return;
    }

    const payload: LocationSite = {
      id: editingLoc ? editingLoc.id : `loc-${Date.now()}`,
      locationName: formName.trim(),
      latitude: Number(formLat),
      longitude: Number(formLng),
      allowedRadiusMeters: Number(formRadius),
      address: formAddress.trim(),
      status: formStatus,
    };

    storage.saveLocation(payload, currentUser.fullName);
    showToast(`Location '${payload.locationName}' saved successfully.`, 'success');
    setIsAddEditOpen(false);
    reload();
  };

  const handleDelete = (loc: LocationSite) => {
    if (confirm(`Are you sure you want to delete ${loc.locationName}?`)) {
      storage.deleteLocation(loc.id, currentUser.fullName);
      showToast('Location removed.', 'warning');
      reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.locationSitesTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure approved hospital clinics, training centers, and geographic geofencing radii for automated verification.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addLocation}</span>
        </button>
      </div>

      {/* Locations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{loc.locationName}</h3>
                    <span
                      className={`inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded ${
                        loc.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {loc.status === 'active' ? t.active : t.inactive}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(loc)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                    title={t.edit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3 leading-relaxed">{loc.address}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">{t.allowedRadius}</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{loc.allowedRadiusMeters} meters</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Coordinates</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Geofencing Active</span>
              <span className="font-mono text-indigo-600">ID: {loc.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingLoc ? `Edit Location: ${editingLoc.locationName}` : t.addLocation}
              </h3>
              <button onClick={() => setIsAddEditOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Site Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Main Training Hospital - Ward B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address / Hall Details</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="e.g. King Fahad Hospital Campus, Gate 4"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-950">GPS Coordinates</span>
                  <button
                    type="button"
                    onClick={handleUseCurrentGPS}
                    disabled={detectingGps}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{detectingGps ? 'Detecting...' : 'Use My Current Location'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">Latitude</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLat}
                      onChange={e => setFormLat(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">Longitude</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLng}
                      onChange={e => setFormLng(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.allowedRadius} (Meters) *</label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    required
                    value={formRadius}
                    onChange={e => setFormRadius(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 150m</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.status}</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                  >
                    <option value="active">{t.active}</option>
                    <option value="inactive">{t.inactive}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
