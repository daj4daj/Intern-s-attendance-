import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Phone, Building, GraduationCap, UserCheck, Calendar, ShieldCheck, HeartPulse, BookOpen } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentStudent, t } = useApp();

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Student account not found.</div>;
  }

  const balance = currentStudent.leaveBalance || {
    annualTotal: 21,
    annualUsed: 0,
    sickTotal: 14,
    sickUsed: 0,
    educationalTotal: 7,
    educationalUsed: 0,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navMyProfile}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic registration records, assigned field supervisors, and official leave quota balance.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
              {currentStudent.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{currentStudent.fullName}</h3>
              <p className="text-xs text-indigo-700 font-mono font-semibold mt-0.5">
                ID: {currentStudent.studentId}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{currentStudent.program}</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-200">
            {t.active} Academic Status
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">{t.email}</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentStudent.email}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">{t.mobile}</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentStudent.mobile || '—'}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">{t.department}</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentStudent.department}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">{t.supervisor}</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentStudent.supervisor}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">Enrollment Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(currentStudent.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] block">Verification Status</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Geofence Enabled</span>
            </span>
          </div>
        </div>
      </div>

      {/* Leave Balance Quota Breakdown */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">{t.remainingLeaveBalance}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Annual */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{t.annualLeave}</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {balance.annualTotal - balance.annualUsed}
              </span>
              <span className="text-xs text-slate-400 font-mono">of {balance.annualTotal} days remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${Math.round((balance.annualUsed / balance.annualTotal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">{balance.annualUsed} days utilized</span>
          </div>

          {/* Sick */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{t.sickLeave}</span>
              <HeartPulse className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {balance.sickTotal - balance.sickUsed}
              </span>
              <span className="text-xs text-slate-400 font-mono">of {balance.sickTotal} days remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-600 h-full rounded-full"
                style={{ width: `${Math.round((balance.sickUsed / balance.sickTotal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">{balance.sickUsed} days utilized</span>
          </div>

          {/* Educational */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{t.educationalLeave}</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {balance.educationalTotal - balance.educationalUsed}
              </span>
              <span className="text-xs text-slate-400 font-mono">of {balance.educationalTotal} days remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${Math.round((balance.educationalUsed / balance.educationalTotal) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">{balance.educationalUsed} days utilized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
