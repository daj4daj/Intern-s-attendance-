import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { StatCard } from '../common/StatCard';
import {
  AttendanceTrendChart,
  HorizontalBarChart,
  DonutChart,
  TrendDataPoint,
  BarDataPoint,
  DonutSegment
} from '../charts/InteractiveCharts';
import {
  Users,
  UserCheck,
  Percent,
  CalendarCheck2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { t, language } = useApp();

  // Global filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedProgram, setSelectedProgram] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const students = storage.getStudents();
  const attendance = storage.getAttendanceRecords();
  const leaves = storage.getLeaveRequests();

  const todayStr = new Date().toISOString().split('T')[0];

  const departments = useMemo(() => {
    return Array.from(new Set(students.map(s => s.department))).sort();
  }, [students]);

  const programs = useMemo(() => {
    return Array.from(new Set(students.map(s => s.program))).sort();
  }, [students]);

  // Filtered Students according to global filters
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedDept !== 'ALL' && s.department !== selectedDept) return false;
      if (selectedProgram !== 'ALL' && s.program !== selectedProgram) return false;
      return true;
    });
  }, [students, selectedDept, selectedProgram]);

  const activeStudentCount = filteredStudents.filter(s => s.status === 'active').length;

  // Filtered Attendance for today
  const todayAttendance = useMemo(() => {
    return attendance.filter(a => {
      if (a.date !== todayStr) return false;
      if (selectedDept !== 'ALL' && a.department !== selectedDept) return false;
      if (selectedProgram !== 'ALL' && a.program !== selectedProgram) return false;
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      return true;
    });
  }, [attendance, todayStr, selectedDept, selectedProgram, statusFilter]);

  // Currently Signed In (no sign-out time recorded yet today)
  const currentlySignedIn = todayAttendance.filter(a => !a.signOutTime);
  const signedOutCount = todayAttendance.filter(a => !!a.signOutTime).length;
  const lateSignInsCount = todayAttendance.filter(a => a.isLate).length;

  // Today's attendance percentage based on active students
  const presentStudentsToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const todayAttendancePct = activeStudentCount > 0 ? Math.round((presentStudentsToday / activeStudentCount) * 100) : 0;

  // Pending Leaves
  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  // Attendance Trend Data (past 14 days)
  const trendData: TrendDataPoint[] = useMemo(() => {
    const points: TrendDataPoint[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      // Skip weekends
      if (dayOfWeek === 5 || dayOfWeek === 6) continue;

      const dayRecords = attendance.filter(a => {
        if (a.date !== dStr) return false;
        if (selectedDept !== 'ALL' && a.department !== selectedDept) return false;
        if (selectedProgram !== 'ALL' && a.program !== selectedProgram) return false;
        return true;
      });

      const dayPresent = dayRecords.filter(a => a.status === 'present' || a.status === 'late').length;
      const rate = activeStudentCount > 0 ? Math.min(100, Math.round((dayPresent / activeStudentCount) * 100)) : 85;

      points.push({
        label: dStr.substring(5), // MM-DD
        rate,
        presentCount: dayPresent,
        total: activeStudentCount,
      });
    }
    return points;
  }, [attendance, selectedDept, selectedProgram, activeStudentCount]);

  // Students by Program Data
  const programData: BarDataPoint[] = useMemo(() => {
    return programs.map(p => {
      const enrolled = filteredStudents.filter(s => s.program === p).length;
      return {
        label: p,
        value: enrolled,
        percentage: activeStudentCount > 0 ? Math.round((enrolled / activeStudentCount) * 100) : 0,
      };
    });
  }, [programs, filteredStudents, activeStudentCount]);

  // Leave Distribution by Type
  const leaveDonutData: DonutSegment[] = useMemo(() => {
    const annual = leaves.filter(l => l.leaveType === 'annual').length;
    const sick = leaves.filter(l => l.leaveType === 'sick').length;
    const educational = leaves.filter(l => l.leaveType === 'educational').length;
    const urgent = leaves.filter(l => l.leaveType === 'urgent').length;

    return [
      { label: t.annualLeave, value: annual, color: '#4f46e5' },
      { label: t.sickLeave, value: sick, color: '#06b6d4' },
      { label: t.educationalLeave, value: educational, color: '#8b5cf6' },
      { label: t.urgentLeave, value: urgent, color: '#f59e0b' },
    ];
  }, [leaves, t]);

  // Attendance Status Breakdown
  const statusDonutData: DonutSegment[] = useMemo(() => {
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const absent = Math.max(0, activeStudentCount - present - late);
    const onLeave = leaves.filter(l => l.status === 'approved' && l.startDate <= todayStr && l.endDate >= todayStr).length;

    return [
      { label: t.present, value: present, color: '#10b981' },
      { label: t.late, value: late, color: '#f59e0b' },
      { label: t.absent, value: absent, color: '#ef4444' },
      { label: t.leave, value: onLeave, color: '#3b82f6' },
    ];
  }, [todayAttendance, activeStudentCount, leaves, todayStr, t]);

  // Exceptions (geofence alerts)
  const exceptions = todayAttendance.filter(a => a.isOutsideGeofence);

  return (
    <div className="space-y-6">
      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Global Institutional Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Time Horizon</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="today">{t.today}</option>
              <option value="week">{t.thisWeek}</option>
              <option value="month">{t.thisMonth}</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">{t.department}</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{t.allDepartments}</option>
              {departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">{t.program}</label>
            <select
              value={selectedProgram}
              onChange={e => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{t.allPrograms}</option>
              {programs.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">{t.status}</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="present">{t.present}</option>
              <option value="late">{t.late}</option>
              <option value="absent">{t.absent}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.totalStudents}
          value={activeStudentCount}
          subtext={`${students.length} total enrolled records`}
          icon={<Users className="w-5 h-5" />}
          colorScheme="indigo"
        />

        <StatCard
          label={t.currentlySignedIn}
          value={currentlySignedIn.length}
          subtext={`${signedOutCount} completed & signed out`}
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
          colorScheme="emerald"
        />

        <StatCard
          label={t.todayAttendanceRate}
          value={`${todayAttendancePct}%`}
          subtext={`${presentStudentsToday} / ${activeStudentCount} active verified`}
          icon={<Percent className="w-5 h-5 text-indigo-600" />}
          colorScheme="indigo"
        />

        <StatCard
          label={t.pendingLeaveRequests}
          value={pendingLeaves.length}
          subtext="Awaiting administrative review"
          icon={<CalendarCheck2 className="w-5 h-5 text-amber-600" />}
          colorScheme="amber"
        />
      </div>

      {/* Row 2: Attendance Trend & Attendance by Program */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">{t.attendanceTrend}</h3>
            <span className="text-[11px] font-mono text-slate-400">14-Day Cycle</span>
          </div>
          <AttendanceTrendChart data={trendData} isArabic={language === 'ar'} />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">{t.studentsByProgram}</h3>
            <span className="text-[11px] font-mono text-slate-400">Enrollment Count</span>
          </div>
          <HorizontalBarChart data={programData} suffix="Students" />
        </div>
      </div>

      {/* Row 3: Leave Distribution & Attendance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">{t.leaveTypesDistribution}</h3>
          <DonutChart data={leaveDonutData} centerSubtext="Leave Requests" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">{t.attendanceStatusDistribution}</h3>
          <DonutChart data={statusDonutData} centerSubtext="Today's Cohort" />
        </div>
      </div>

      {/* Row 4: Recent Sign-Ins, Pending Leaves, Attendance Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sign-Ins */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">Today's Sign-In Stream</h3>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
            {todayAttendance.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No sign-ins recorded yet today.</div>
            ) : (
              todayAttendance.slice(0, 5).map(att => (
                <div key={att.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-800 block truncate">{att.studentName}</span>
                    <span className="text-[11px] text-slate-400 truncate block">{att.signInLocationName}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-slate-700 text-[11px] block">
                      {new Date(att.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        att.isLate ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {att.isLate ? 'Late' : 'On-Time'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">{t.pendingLeaveRequests}</h3>
            <button
              onClick={() => onNavigateTab('leaves')}
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
            {pendingLeaves.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No pending leave requests.</div>
            ) : (
              pendingLeaves.slice(0, 4).map(leave => (
                <div key={leave.id} className="p-3 text-xs hover:bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{leave.studentName}</span>
                    <span className="capitalize font-mono text-[10px] text-indigo-700 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                      {leave.leaveType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {leave.startDate} → {leave.endDate} ({leave.totalDays}d)
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">"{leave.reason}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Exceptions (Geofence violations) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900">Geofence Flagged</h3>
            </div>
            <span className="text-[11px] font-mono text-rose-600 font-bold">
              {exceptions.length} today
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
            {exceptions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <p>All student arrivals within authorized geofences.</p>
              </div>
            ) : (
              exceptions.map(exc => (
                <div key={exc.id} className="p-3 text-xs hover:bg-slate-50 bg-rose-50/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{exc.studentName}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(exc.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{exc.signInLocationName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                    Device: {exc.deviceInfo}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
