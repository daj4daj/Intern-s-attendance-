import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { MonthlyCalendar } from './MonthlyCalendar';
import { Clock, Calendar, Download, List, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '../../services/export';

export const MyAttendance: React.FC = () => {
  const { currentStudent, t } = useApp();
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  if (!currentStudent) return null;

  const records = storage.getAttendanceRecords().filter(a => a.studentId === currentStudent.studentId);
  const approvedLeaves = storage.getLeaveRequests().filter(
    l => l.studentId === currentStudent.studentId && l.status === 'approved'
  );

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Sign-In Time',
      'Sign-In Location',
      'Sign-Out Time',
      'Sign-Out Location',
      'Duration (Mins)',
      'Status',
      'Late',
    ];
    const rows = records.map(r => [
      r.date,
      new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      r.signInLocationName,
      r.signOutTime ? new Date(r.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
      r.signOutLocationName || '—',
      r.durationMinutes || '—',
      r.status,
      r.isLate ? 'YES' : 'NO',
    ]);

    exportToCSV(`my_attendance_${currentStudent.studentId}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navMyAttendance}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal attendance ledger, clinical shift hours, and punctuality records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table Log</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.exportCSV}</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <MonthlyCalendar attendanceRecords={records} approvedLeaves={approvedLeaves} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">{t.signInTime}</th>
                  <th className="py-3 px-4 font-semibold">Sign-In Location Site</th>
                  <th className="py-3 px-4 font-semibold">{t.signOutTime}</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No attendance logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {r.isLate && (
                          <span className="ml-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-sans">
                            Late
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {r.signInLocationName}
                        {r.isOutsideGeofence && (
                          <span className="block text-[10px] text-rose-600 mt-0.5">
                            * Geofence boundary exception noted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {r.signOutTime ? (
                          new Date(r.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        ) : (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                        {r.durationMinutes
                          ? `${Math.floor(r.durationMinutes / 60)}h ${r.durationMinutes % 60}m`
                          : 'In progress'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            r.status === 'present'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.status === 'late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {r.status === 'present' ? t.present : r.status === 'late' ? t.late : t.absent}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
