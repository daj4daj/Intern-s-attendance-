import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import {
  Clock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Edit,
  X,
  Printer,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { exportToCSV, printFormattedReport } from '../../services/export';

export const AttendanceManagement: React.FC = () => {
  const { t, showToast, refreshData, currentUser, language } = useApp();
  const [records, setRecords] = useState<AttendanceRecord[]>(() => storage.getAttendanceRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [geofenceOnly, setGeofenceOnly] = useState(false);

  // Manual Edit Modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('present');
  const [editSignInTime, setEditSignInTime] = useState('');
  const [editSignOutTime, setEditSignOutTime] = useState('');
  const [editAdminReason, setEditAdminReason] = useState('');

  const reloadRecords = () => {
    setRecords(storage.getAttendanceRecords());
    refreshData();
  };

  const departments = useMemo(() => {
    const depts = Array.from(new Set(records.map(r => r.department).filter(Boolean))) as string[];
    return depts.sort();
  }, [records]);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Date filter
      if (dateFilter === 'today' && r.date !== todayStr) return false;
      if (dateFilter === 'week') {
        const recordDate = new Date(r.date).getTime();
        const weekAgo = Date.now() - 7 * 86400000;
        if (recordDate < weekAgo) return false;
      }
      if (dateFilter === 'month') {
        const recordDate = new Date(r.date).getTime();
        const monthAgo = Date.now() - 30 * 86400000;
        if (recordDate < monthAgo) return false;
      }

      // Department filter
      if (deptFilter !== 'ALL' && r.department !== deptFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      // Geofence exception only
      if (geofenceOnly && !r.isOutsideGeofence) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.studentName?.toLowerCase().includes(q);
        const matchId = r.studentId.toLowerCase().includes(q);
        const matchLoc = r.signInLocationName.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchLoc) return false;
      }

      return true;
    });
  }, [records, dateFilter, deptFilter, statusFilter, geofenceOnly, searchQuery, todayStr]);

  const openEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditSignInTime(rec.signInTime ? rec.signInTime.substring(0, 16) : '');
    setEditSignOutTime(rec.signOutTime ? rec.signOutTime.substring(0, 16) : '');
    setEditAdminReason('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!editAdminReason.trim()) {
      showToast('Admin justification note is mandatory for audit compliance.', 'error');
      return;
    }

    const updated: AttendanceRecord = {
      ...editingRecord,
      status: editStatus,
      isLate: editStatus === 'late',
      signInTime: editSignInTime ? new Date(editSignInTime).toISOString() : editingRecord.signInTime,
      signOutTime: editSignOutTime ? new Date(editSignOutTime).toISOString() : editingRecord.signOutTime,
      modifiedByAdmin: true,
      adminNote: editAdminReason,
    };

    if (updated.signInTime && updated.signOutTime) {
      const diff = Math.round(
        (new Date(updated.signOutTime).getTime() - new Date(updated.signInTime).getTime()) / 60000
      );
      updated.durationMinutes = Math.max(0, diff);
    }

    storage.modifyAttendanceRecordByAdmin(updated, currentUser.fullName, editAdminReason);
    showToast('Attendance record updated and logged to Audit Trail.', 'success');
    setEditingRecord(null);
    reloadRecords();
  };

  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Department',
      'Date',
      'Sign-In Time',
      'Sign-In Location',
      'Sign-Out Time',
      'Sign-Out Location',
      'Duration (Mins)',
      'Status',
      'Late',
      'Geofence Exception',
      'Admin Modified',
    ];

    const rows = filteredRecords.map(r => [
      r.studentId,
      r.studentName || '',
      r.department || '',
      r.date,
      new Date(r.signInTime).toLocaleTimeString(),
      r.signInLocationName,
      r.signOutTime ? new Date(r.signOutTime).toLocaleTimeString() : 'Active Session',
      r.signOutLocationName || 'N/A',
      r.durationMinutes ?? 'In Progress',
      r.status,
      r.isLate ? 'YES' : 'NO',
      r.isOutsideGeofence ? 'YES' : 'NO',
      r.modifiedByAdmin ? `YES (${r.adminNote})` : 'NO',
    ]);

    exportToCSV(`attendance_records_${dateFilter}_${todayStr}`, headers, rows);
    showToast('Attendance records exported to CSV.', 'success');
  };

  const handlePrintPDF = () => {
    const meta = [
      { label: 'Filter Period', value: dateFilter.toUpperCase() },
      { label: 'Total Logs', value: String(filteredRecords.length) },
      { label: 'Department', value: deptFilter },
      { label: 'Verified By', value: currentUser.fullName },
    ];

    const headers = ['Student ID', 'Name', 'Department', 'Date', 'Sign In', 'Sign Out', 'Duration', 'Status'];
    const rows = filteredRecords.map(r => [
      r.studentId,
      r.studentName || '',
      r.department || '',
      r.date,
      new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      r.signOutTime ? new Date(r.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Signed In',
      r.durationMinutes ? `${Math.floor(r.durationMinutes / 60)}h ${r.durationMinutes % 60}m` : 'In Progress',
      r.status.toUpperCase(),
    ]);

    printFormattedReport('Student Attendance Verification Report', meta, headers, rows, language === 'ar');
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navAttendance}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily check-in timestamps, GPS coordinates, geofence validations, and historical logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.exportPDF}</span>
          </button>
        </div>
      </div>

      {/* Filter and Query Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchStudent}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Date Segment */}
          <div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="today">{t.today}</option>
              <option value="week">{t.thisWeek}</option>
              <option value="month">{t.thisMonth}</option>
              <option value="all">All Dates</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="ALL">{t.allDepartments}</option>
              {departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="present">{t.present}</option>
              <option value="late">{t.late}</option>
              <option value="absent">{t.absent}</option>
              <option value="leave">{t.leave}</option>
            </select>
          </div>

          {/* Geofence Exceptions toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs font-medium">
              <input
                type="checkbox"
                checked={geofenceOnly}
                onChange={e => setGeofenceOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="truncate">Geofence Flagged Only</span>
            </label>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
          <span>
            Displaying <strong className="font-mono text-slate-800">{filteredRecords.length}</strong> attendance entries
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Late arrivals: {filteredRecords.filter(r => r.isLate).length}
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Geofence warnings: {filteredRecords.filter(r => r.isOutsideGeofence).length}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.studentId}</th>
                <th className="py-3 px-4 font-semibold">{t.fullName}</th>
                <th className="py-3 px-4 font-semibold">{t.department}</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">{t.signInTime} & Location</th>
                <th className="py-3 px-4 font-semibold">{t.signOutTime} & Location</th>
                <th className="py-3 px-4 font-semibold">{t.totalHours}</th>
                <th className="py-3 px-4 font-semibold">{t.status}</th>
                <th className="py-3 px-4 font-semibold text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const formatTime = (iso?: string | null) => {
                    if (!iso) return null;
                    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  };

                  const durationDisplay = record.durationMinutes
                    ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m`
                    : record.signOutTime === null
                    ? 'Active Session'
                    : '—';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                        {record.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{record.studentName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]">
                        {record.department}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-800 flex items-center gap-1.5">
                          {formatTime(record.signInTime)}
                          {record.isLate && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-sans font-semibold border border-amber-200">
                              Late
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={record.signInLocationName}>
                          {record.signInLocationName}
                        </div>
                        {record.isOutsideGeofence && (
                          <div className="text-[10px] text-rose-600 flex items-center gap-1 mt-0.5 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Outside geofence
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.signOutTime ? (
                          <>
                            <div className="font-mono font-medium text-slate-800">
                              {formatTime(record.signOutTime)}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {record.signOutLocationName || 'Hospital Exit'}
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Signed In
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                        {durationDisplay}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            record.status === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : record.status === 'late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : record.status === 'leave'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {record.status === 'present'
                            ? t.present
                            : record.status === 'late'
                            ? t.late
                            : record.status === 'leave'
                            ? t.leave
                            : t.absent}
                        </span>
                        {record.modifiedByAdmin && (
                          <span
                            className="block text-[10px] text-purple-600 mt-0.5 font-mono cursor-help"
                            title={`Adjusted by Admin. Note: ${record.adminNote}`}
                          >
                            * Admin Adjusted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(record)}
                          title="Manually adjust attendance (Logs to Audit)"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Adjustment Modal (Audit Controlled) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Manual Record Adjustment: {editingRecord.studentName}
                </h3>
              </div>
              <button onClick={() => setEditingRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] leading-relaxed">
                <strong>Audit Compliance Warning:</strong> Any manual change made here is strictly recorded with your administrator identity in the system audit logs.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attendance Status *</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                >
                  <option value="present">{t.present}</option>
                  <option value="late">{t.late}</option>
                  <option value="absent">{t.absent}</option>
                  <option value="leave">{t.leave}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sign-In Time</label>
                  <input
                    type="datetime-local"
                    value={editSignInTime}
                    onChange={e => setEditSignInTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sign-Out Time</label>
                  <input
                    type="datetime-local"
                    value={editSignOutTime}
                    onChange={e => setEditSignOutTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Manual Override (Mandatory) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editAdminReason}
                  onChange={e => setEditAdminReason(e.target.value)}
                  placeholder="e.g. Student presented official hospital clinic supervisor slip verifying arrival at 08:00 AM."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save & Log to Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
