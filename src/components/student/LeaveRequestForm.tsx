import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { LeaveType } from '../../types';
import { Calendar, Upload, FileText, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';

interface LeaveRequestFormProps {
  onSuccess?: () => void;
}

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({ onSuccess }) => {
  const { currentStudent, showToast, refreshData, t } = useApp();

  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [reason, setReason] = useState('');
  const [educationalActivity, setEducationalActivity] = useState('');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; size: string; type: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Set default dates (tomorrow and day after)
  useEffect(() => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 1);
    const d2 = new Date();
    d2.setDate(d2.getDate() + 2);

    const s1 = d1.toISOString().split('T')[0];
    const s2 = d2.toISOString().split('T')[0];
    setStartDate(s1);
    setEndDate(s2);
  }, []);

  // Recalculate days inclusive
  useEffect(() => {
    if (!startDate || !endDate) {
      setCalculatedDays(0);
      return;
    }
    const t1 = new Date(startDate).getTime();
    const t2 = new Date(endDate).getTime();
    if (t2 < t1) {
      setCalculatedDays(0);
      return;
    }
    const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24)) + 1;
    setCalculatedDays(Math.max(1, diffDays));
  }, [startDate, endDate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB maximum limit.');
      return;
    }

    // Validate type (pdf, png, jpg, jpeg)
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setAttachment({
      name: file.name,
      size: sizeStr,
      type: file.type,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    if (!startDate || !endDate || calculatedDays <= 0) {
      showToast('Please provide a valid start and end date range.', 'error');
      return;
    }

    if (!reason.trim()) {
      showToast('Please state a reason or justification for this leave.', 'error');
      return;
    }

    if (leaveType === 'sick' && !attachment) {
      showToast('A medical certificate attachment is required for Sick Leave.', 'error');
      return;
    }

    if (leaveType === 'educational' && !educationalActivity.trim()) {
      showToast('Educational course or workshop title is required.', 'error');
      return;
    }

    if (leaveType === 'urgent' && !emergencyDescription.trim()) {
      showToast('Please specify the emergency details for Urgent Leave.', 'error');
      return;
    }

    const result = storage.submitLeaveRequest({
      studentId: currentStudent.studentId,
      studentName: currentStudent.fullName,
      studentEmail: currentStudent.email,
      department: currentStudent.department,
      leaveType,
      startDate,
      endDate,
      totalDays: calculatedDays,
      reason: reason.trim(),
      educationalActivity: educationalActivity.trim() || undefined,
      emergencyDescription: emergencyDescription.trim() || undefined,
      attachmentName: attachment?.name,
      attachmentSize: attachment?.size,
    });

    if (result.success) {
      showToast(t.leaveSubmittedSuccess, 'success');
      setReason('');
      setEducationalActivity('');
      setEmergencyDescription('');
      setAttachment(null);
      refreshData();
      if (onSuccess) onSuccess();
    } else {
      showToast(result.error || 'Failed to submit leave request.', 'error');
    }
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Student account not found.</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{t.submitLeaveRequest}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit formal leave notification for academic supervisor and administrative clearance.
          </p>
        </div>
        <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
          ID: {currentStudent.studentId}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Leave Type Selector */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">{t.leaveType} *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'annual', label: t.annualLeave },
              { id: 'sick', label: t.sickLeave },
              { id: 'educational', label: t.educationalLeave },
              { id: 'urgent', label: t.urgentLeave },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLeaveType(item.id as LeaveType)}
                className={`py-2 px-2.5 rounded-lg border font-medium text-center transition-colors truncate ${
                  leaveType === item.id
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range & Calculated Days */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t.startDate} *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t.endDate} *</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t.calculatedDays}</label>
            <div className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg font-mono font-bold text-indigo-900 text-center">
              {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Educational activity conditional */}
        {leaveType === 'educational' && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t.educationalCourse} *</label>
            <input
              type="text"
              required
              value={educationalActivity}
              onChange={e => setEducationalActivity(e.target.value)}
              placeholder="e.g. Clinical Ultrasound Simulation Workshop"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
            />
          </div>
        )}

        {/* Urgent leave emergency conditional */}
        {leaveType === 'urgent' && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">{t.emergencyDesc} *</label>
            <input
              type="text"
              required
              value={emergencyDescription}
              onChange={e => setEmergencyDescription(e.target.value)}
              placeholder="e.g. Immediate family medical emergency requiring interstate travel"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
            />
          </div>
        )}

        {/* Reason / Justification */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t.reasonForLeave} *</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Provide a comprehensive explanation of your request..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* File Attachment Upload */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {t.attachmentLabel} {leaveType === 'sick' ? '(Required for Sick Leave)' : '(Optional)'}
          </label>
          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 flex items-center justify-between">
            {attachment ? (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-800">{attachment.name}</span>
                <span className="text-slate-400 font-mono">({attachment.size})</span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                <Upload className="w-4 h-4" />
                <span>Upload Document (PDF, PNG, JPG)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <span className="text-[10px] text-slate-400">{t.uploadLimitNotice}</span>
          </div>
          {fileError && <p className="text-[11px] text-rose-600 mt-1">{fileError}</p>}
        </div>

        {/* Submit button */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.submitLeaveRequest}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
