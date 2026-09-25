import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Info } from 'lucide-react';

interface MonthlyCalendarProps {
  attendanceRecords: AttendanceRecord[];
  approvedLeaves: LeaveRequest[];
  onDayClick?: (dateStr: string, details?: any) => void;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  attendanceRecords,
  approvedLeaves,
  onDayClick,
}) => {
  const { t, language } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dateStr: string;
    status: string;
    details: string;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map of date string YYYY-MM-DD to status
  const getDayStatus = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, day).getDay();

    // Weekend (Friday & Saturday in Middle East academic systems)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      return { status: 'holiday', label: t.holiday, details: 'Academic Weekend' };
    }

    // Check approved leave
    const leave = approvedLeaves.find(l => l.startDate <= dStr && l.endDate >= dStr);
    if (leave) {
      return {
        status: 'leave',
        label: t.leave,
        details: `Approved ${leave.leaveType.toUpperCase()} leave: ${leave.reason}`,
      };
    }

    // Check attendance record
    const att = attendanceRecords.find(a => a.date === dStr);
    if (att) {
      if (att.isLate) {
        return {
          status: 'late',
          label: t.late,
          details: `Arrived Late at ${new Date(att.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${att.durationMinutes || 'In session'} mins)`,
        };
      }
      return {
        status: 'present',
        label: t.present,
        details: `Present: Checked in at ${new Date(att.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      };
    }

    // Past date without record = absent, Future date = noRecord
    const todayStr = new Date().toISOString().split('T')[0];
    if (dStr < todayStr) {
      return { status: 'absent', label: t.absent, details: 'No attendance record registered.' };
    }

    return { status: 'no_record', label: t.noRecord, details: 'Scheduled academic session.' };
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-semibold';
      case 'late':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 font-semibold';
      case 'absent':
        return 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 font-semibold';
      case 'leave':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 font-semibold';
      case 'holiday':
        return 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100';
      default:
        return 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {dayHeaders.map(dh => (
          <div key={dh} className="text-[11px] font-semibold text-slate-400 py-1 font-mono">
            {dh}
          </div>
        ))}

        {/* Empty leading padding */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 min-h-12 bg-slate-50/30 rounded-lg opacity-40" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { status, label, details } = getDayStatus(day);
          const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dStr === new Date().toISOString().split('T')[0];

          return (
            <button
              key={day}
              onClick={() => setSelectedDayInfo({ dateStr: dStr, status, details })}
              className={`p-1.5 min-h-14 sm:min-h-16 rounded-lg border text-left flex flex-col justify-between transition-all relative ${getStatusClasses(
                status
              )} ${isToday ? 'ring-2 ring-indigo-600 ring-offset-1' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono font-bold">{day}</span>
                {isToday && (
                  <span className="text-[9px] uppercase font-bold text-indigo-600 font-sans">Today</span>
                )}
              </div>
              <div className="text-[10px] truncate capitalize font-medium opacity-90 mt-1">
                {label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Info Card */}
      {selectedDayInfo && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <span>{selectedDayInfo.dateStr}</span>
              <span className="capitalize font-mono text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200">
                {selectedDayInfo.status}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">{selectedDayInfo.details}</p>
          </div>
          <button
            onClick={() => setSelectedDayInfo(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
          <span>{t.present}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span>{t.late}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-500" />
          <span>{t.absent}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
          <span>{t.leave}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-300" />
          <span>{t.holiday}</span>
        </div>
      </div>
    </div>
  );
};
