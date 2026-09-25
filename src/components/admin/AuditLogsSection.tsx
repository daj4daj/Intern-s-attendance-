import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { ShieldAlert, Search, Filter, Download } from 'lucide-react';
import { exportToCSV } from '../../services/export';

export const AuditLogsSection: React.FC = () => {
  const { t, showToast } = useApp();
  const [logs] = useState(() => storage.getAuditLogs());
  const [search, setSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (targetTypeFilter !== 'ALL' && l.targetType !== targetTypeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const mAction = l.action.toLowerCase().includes(q);
        const mBy = l.performedBy.toLowerCase().includes(q);
        const mDet = l.details.toLowerCase().includes(q);
        if (!mAction && !mBy && !mDet) return false;
      }
      return true;
    });
  }, [logs, search, targetTypeFilter]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Action Code', 'Performed By', 'Role', 'Target Type', 'Target ID', 'Details'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      l.action,
      l.performedBy,
      l.performerRole,
      l.targetType,
      l.targetId || 'N/A',
      l.details,
    ]);
    exportToCSV(`audit_trail_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('Audit log export completed.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.auditLogTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system logs recording administrative adjustments, leave decisions, accounts, and geofence events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs self-start"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Export Audit Log</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, administrator, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="w-48">
          <select
            value={targetTypeFilter}
            onChange={e => setTargetTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-700"
          >
            <option value="ALL">All Target Entities</option>
            <option value="attendance">Attendance Modifications</option>
            <option value="leave">Leave Actions</option>
            <option value="student">Student Accounts</option>
            <option value="location">Location Configs</option>
            <option value="bulk_import">Bulk Imports</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Performed By</th>
                <th className="py-3 px-4 font-semibold">Entity</th>
                <th className="py-3 px-4 font-semibold">Audit Details & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-sans font-medium text-slate-900">
                    {log.performedBy}
                    <span className="text-[10px] text-slate-400 block font-mono capitalize">
                      {log.performerRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] text-indigo-700 font-bold whitespace-nowrap">
                    {log.targetType}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
