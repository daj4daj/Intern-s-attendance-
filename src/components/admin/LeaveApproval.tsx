import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { LeaveRequest, LeaveStatus } from '../../types';
import {
  CalendarCheck2,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  Download,
  X,
  MessageSquare,
  Clock,
  Paperclip,
  Check
} from 'lucide-react';
import { exportToCSV } from '../../services/export';

export const LeaveApproval: React.FC = () => {
  const { t, showToast, refreshData, currentUser } = useApp();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => storage.getLeaveRequests());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Review Modal state
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'info_requested'>('approved');
  const [adminComment, setAdminComment] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);

  const reloadLeaves = () => {
    setLeaves(storage.getLeaveRequests());
    refreshData();
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && l.leaveType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mName = l.studentName.toLowerCase().includes(q);
        const mId = l.studentId.toLowerCase().includes(q);
        const mReason = l.reason.toLowerCase().includes(q);
        if (!mName && !mId && !mReason) return false;
      }
      return true;
    });
  }, [leaves, statusFilter, typeFilter, searchQuery]);

  const openReviewModal = (leave: LeaveRequest, action: 'approved' | 'rejected' | 'info_requested') => {
    setReviewingLeave(leave);
    setDecision(action);
    setAdminComment(leave.adminComment || '');
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLeave) return;

    if (decision === 'rejected' && !adminComment.trim()) {
      showToast('A reason must be stated when rejecting a leave request.', 'error');
      return;
    }

    storage.reviewLeaveRequest({
      leaveId: reviewingLeave.id,
      decision,
      adminComment: adminComment.trim(),
      adminName: currentUser.fullName,
    });

    showToast(`Leave request ${decision} successfully. Student has been notified.`, 'success');
    setReviewingLeave(null);
    reloadLeaves();
  };

  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Student Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Total Days',
      'Status',
      'Submission Date',
      'Reviewed By',
      'Admin Comments',
    ];
    const rows = filteredLeaves.map(l => [
      l.studentId,
      l.studentName,
      l.department,
      l.leaveType,
      l.startDate,
      l.endDate,
      l.totalDays,
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
      l.reviewedBy || 'Pending',
      l.adminComment || 'N/A',
    ]);
    exportToCSV(`leave_requests_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('Leave requests exported to CSV.', 'success');
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            {t.approved}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
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
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {t.cancelled}
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
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navLeaveRequests}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review academic and medical absences, verify supporting certificates, and log administrative decisions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs self-start"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t.exportCSV}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="pending">{t.pending}</option>
              <option value="approved">{t.approved}</option>
              <option value="rejected">{t.rejected}</option>
              <option value="info_requested">{t.infoRequested}</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-slate-700"
            >
              <option value="ALL">All Leave Types</option>
              <option value="annual">{t.annualLeave}</option>
              <option value="sick">{t.sickLeave}</option>
              <option value="educational">{t.educationalLeave}</option>
              <option value="urgent">{t.urgentLeave}</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
          <span>
            Found <strong className="font-mono text-slate-800">{filteredLeaves.length}</strong> leave requests
          </span>
          <span className="text-indigo-600 font-semibold">
            {leaves.filter(l => l.status === 'pending').length} pending review
          </span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.studentId}</th>
                <th className="py-3 px-4 font-semibold">{t.fullName}</th>
                <th className="py-3 px-4 font-semibold">{t.leaveType}</th>
                <th className="py-3 px-4 font-semibold">Dates & Days</th>
                <th className="py-3 px-4 font-semibold">Reason & Attachment</th>
                <th className="py-3 px-4 font-semibold">{t.submissionDate}</th>
                <th className="py-3 px-4 font-semibold">{t.status}</th>
                <th className="py-3 px-4 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CalendarCheck2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {leave.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{leave.studentName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{leave.department}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap capitalize font-medium text-slate-800">
                      {leave.leaveType === 'annual'
                        ? t.annualLeave
                        : leave.leaveType === 'sick'
                        ? t.sickLeave
                        : leave.leaveType === 'educational'
                        ? t.educationalLeave
                        : t.urgentLeave}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 whitespace-nowrap">
                        {leave.startDate} → {leave.endDate}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-700 line-clamp-2 leading-relaxed" title={leave.reason}>
                        {leave.reason}
                      </p>
                      {leave.educationalActivity && (
                        <div className="text-[10px] text-indigo-600 mt-0.5 truncate">
                          Course: {leave.educationalActivity}
                        </div>
                      )}
                      {leave.emergencyDescription && (
                        <div className="text-[10px] text-rose-600 mt-0.5 truncate">
                          Urgent: {leave.emergencyDescription}
                        </div>
                      )}
                      {leave.attachmentName && (
                        <button
                          onClick={() => setPreviewAttachment(leave.attachmentName || '')}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[160px]">{leave.attachmentName}</span>
                          {leave.attachmentSize && <span className="text-slate-400">({leave.attachmentSize})</span>}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                      {leave.reviewedBy && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          By {leave.reviewedBy}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {leave.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openReviewModal(leave, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition-colors"
                          >
                            {t.approve}
                          </button>
                          <button
                            onClick={() => openReviewModal(leave, 'rejected')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[11px] transition-colors"
                          >
                            {t.reject}
                          </button>
                          <button
                            onClick={() => openReviewModal(leave, 'info_requested')}
                            className="px-2 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-medium text-[11px] transition-colors"
                          >
                            Info
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openReviewModal(leave, leave.status as any)}
                          className="text-slate-500 hover:text-indigo-600 text-[11px] font-medium"
                        >
                          View Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Decision Modal */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Review Leave Request: {reviewingLeave.studentName}
              </h3>
              <button onClick={() => setReviewingLeave(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDecision} className="p-6 space-y-4">
              {/* Summary card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">{reviewingLeave.studentName}</span>
                  <span className="font-mono text-indigo-700">{reviewingLeave.studentId}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-3">
                  <span>Type: <strong className="capitalize text-slate-800">{reviewingLeave.leaveType}</strong></span>
                  <span>·</span>
                  <span>Duration: <strong className="font-mono text-slate-800">{reviewingLeave.totalDays} day(s)</strong></span>
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  {reviewingLeave.startDate} to {reviewingLeave.endDate}
                </div>
                <div className="pt-1 text-slate-700 italic border-t border-slate-200/60">
                  "{reviewingLeave.reason}"
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Decision Action *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      decision === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t.approve}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      decision === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{t.reject}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('info_requested')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      decision === 'info_requested'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>More Info</span>
                  </button>
                </div>
              </div>

              {/* Admin Comment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.adminComment} {decision === 'rejected' ? '*' : '(Optional)'}
                </label>
                <textarea
                  rows={3}
                  required={decision === 'rejected'}
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                  placeholder={
                    decision === 'approved'
                      ? 'e.g. Approved. Clinical rotation schedule adjusted.'
                      : decision === 'rejected'
                      ? 'e.g. Rejected due to scheduling conflict with mandatory rotation exam.'
                      : 'e.g. Please upload official stamped hospital admission letter.'
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingLeave(null)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {t.confirmDecision}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{previewAttachment}</h4>
              <p className="text-slate-500 text-xs mt-1">Verified Institutional Supporting Document</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-left text-xs font-mono space-y-1">
              <div className="text-slate-400">File Type: PDF Document (MIME: application/pdf)</div>
              <div className="text-slate-400">Integrity Hash: SHA-256 Verified</div>
              <div className="text-emerald-600 font-semibold">Status: Clean & Verified by Portal Antivirus</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  showToast(`Downloading verified attachment: ${previewAttachment}`, 'info');
                  setPreviewAttachment(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
