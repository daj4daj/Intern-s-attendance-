import React from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { CalendarCheck2, Clock, CheckCircle, XCircle, HelpCircle, Paperclip } from 'lucide-react';
import { LeaveStatus } from '../../types';

export const MyLeaves: React.FC = () => {
  const { currentStudent, t } = useApp();

  if (!currentStudent) return null;

  const leaves = storage.getLeaveRequests().filter(l => l.studentId === currentStudent.studentId);

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            {t.approved}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            {t.rejected}
          </span>
        );
      case 'info_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            {t.infoRequested}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3 text-indigo-600 animate-spin" />
            {t.pending}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navMyLeaves}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          History of all submitted academic, medical, and personal absence requests and review feedback.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.leaveType}</th>
                <th className="py-3 px-4 font-semibold">Date Range & Days</th>
                <th className="py-3 px-4 font-semibold">{t.reasonForLeave}</th>
                <th className="py-3 px-4 font-semibold">Submitted On</th>
                <th className="py-3 px-4 font-semibold">{t.status}</th>
                <th className="py-3 px-4 font-semibold">Reviewer Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CalendarCheck2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No leave requests on record.
                  </td>
                </tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 whitespace-nowrap capitalize font-bold text-slate-800">
                      {l.leaveType}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-800">
                        {l.startDate} → {l.endDate}
                      </div>
                      <span className="text-[11px] text-slate-500 font-semibold">{l.totalDays} day(s)</span>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-slate-700 leading-relaxed line-clamp-2">{l.reason}</p>
                      {l.attachmentName && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-600 font-medium">
                          <Paperclip className="w-3 h-3" />
                          <span>{l.attachmentName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(l.status)}</td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {l.adminComment ? (
                        <div>
                          <div className="italic text-slate-800">"{l.adminComment}"</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">By {l.reviewedBy}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">Awaiting Review</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
