import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StatCard } from '../common/StatCard';
import { MonthlyCalendar } from './MonthlyCalendar';
import {
  Clock,
  CalendarCheck,
  Send,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { currentStudent, t } = useApp();

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please select an active student account to access the dashboard.
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const studentAttendance = useMemo(() => {
    return storage.getAttendanceRecords().filter(a => a.studentId === currentStudent.studentId);
  }, [currentStudent]);

  const studentLeaves = useMemo(() => {
    return storage.getLeaveRequests().filter(l => l.studentId === currentStudent.studentId);
  }, [currentStudent]);

  const approvedLeaves = studentLeaves.filter(l => l.status === 'approved');
  const pendingLeaves = studentLeaves.filter(l => l.status === 'pending');

  // Today's attendance record
  const todayRecord = studentAttendance.find(a => a.date === todayStr);
  const activeSession = todayRecord && !todayRecord.signOutTime ? todayRecord : null;

  // Total attendance hours across all records
  const totalMinutes = studentAttendance.reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Total approved leave days
  const totalApprovedDays = approvedLeaves.reduce((acc, cur) => acc + cur.totalDays, 0);

  // Remaining leave balance
  const balance = currentStudent.leaveBalance || {
    annualTotal: 21,
    annualUsed: 0,
    sickTotal: 14,
    sickUsed: 0,
    educationalTotal: 7,
    educationalUsed: 0,
  };
  const totalRemainingDays =
    balance.annualTotal - balance.annualUsed + (balance.sickTotal - balance.sickUsed) + (balance.educationalTotal - balance.educationalUsed);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold mb-1">
            Clinical & Academic Portal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t.welcomeBack}, {currentStudent.fullName}
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            {currentStudent.program} · Supervisor: {currentStudent.supervisor}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {activeSession ? (
            <button
              onClick={() => onNavigateTab('sign-in-out')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.actionSignOut}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('sign-in-out')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4 text-indigo-600" />
              <span>{t.actionSignIn}</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('request-leave')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white border border-indigo-500/40 rounded-xl text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.actionSubmitLeave}</span>
          </button>
        </div>
      </div>

      {/* Row 1: Personal KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.todayStatus}
          value={
            activeSession
              ? 'Signed In'
              : todayRecord?.signOutTime
              ? 'Completed'
              : 'Not Checked In'
          }
          subtext={
            todayRecord
              ? `In: ${new Date(todayRecord.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Check in at training site'
          }
          icon={<Clock className="w-5 h-5 text-indigo-600" />}
          colorScheme={activeSession ? 'emerald' : todayRecord ? 'indigo' : 'slate'}
        />

        <StatCard
          label={t.totalHours}
          value={`${totalHours} hrs`}
          subtext={`${studentAttendance.length} completed sessions`}
          icon={<Clock className="w-5 h-5 text-emerald-600" />}
          colorScheme="emerald"
        />

        <StatCard
          label={t.pendingLeaveRequests}
          value={pendingLeaves.length}
          subtext={`${approvedLeaves.length} approved historically`}
          icon={<CalendarCheck className="w-5 h-5 text-amber-500" />}
          colorScheme="amber"
        />

        <StatCard
          label={t.remainingLeaveBalance}
          value={`${totalRemainingDays} days`}
          subtext={`${totalApprovedDays} approved days utilized`}
          icon={<CalendarDays className="w-5 h-5 text-indigo-600" />}
          colorScheme="indigo"
        />
      </div>

      {/* Row 2: Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('sign-in-out')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">{t.navSignInOut}</span>
          <span className="text-[11px] text-slate-400">GPS geofence check-in</span>
        </button>

        <button
          onClick={() => onNavigateTab('request-leave')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
            <Send className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">{t.navRequestLeave}</span>
          <span className="text-[11px] text-slate-400">Apply for time off</span>
        </button>

        <button
          onClick={() => onNavigateTab('my-attendance')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">{t.navMyAttendance}</span>
          <span className="text-[11px] text-slate-400">Review log history</span>
        </button>

        <button
          onClick={() => onNavigateTab('my-leaves')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 block">{t.navMyLeaves}</span>
          <span className="text-[11px] text-slate-400">Track approval status</span>
        </button>
      </div>

      {/* Row 3: Monthly Attendance Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Monthly Attendance Calendar</h3>
          <span className="text-xs text-slate-500">Click any day to view check-in timestamp details</span>
        </div>
        <MonthlyCalendar
          attendanceRecords={studentAttendance}
          approvedLeaves={approvedLeaves}
        />
      </div>
    </div>
  );
};
