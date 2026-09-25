import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { FileBarChart2, Download, Printer, Filter, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { exportToCSV, exportToExcel, printFormattedReport } from '../../services/export';

type ReportType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'student'
  | 'leave'
  | 'program'
  | 'department'
  | 'late'
  | 'absence';

export const ReportsSection: React.FC = () => {
  const { t, showToast, currentUser, language } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');

  const students = storage.getStudents();
  const attendance = storage.getAttendanceRecords();
  const leaves = storage.getLeaveRequests();

  const reportTitles: Record<ReportType, string> = {
    daily: t.dailyReport,
    weekly: t.weeklyReport,
    monthly: t.monthlyReport,
    student: t.studentReport,
    leave: t.leaveReport,
    program: t.programReport,
    department: t.deptReport,
    late: t.lateArrivalReport,
    absence: t.absenceReport,
  };

  const departments = useMemo(() => {
    return Array.from(new Set(students.map(s => s.department))).sort();
  }, [students]);

  // Compute dataset for selected report
  const reportData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    switch (selectedReport) {
      case 'daily': {
        const records = attendance.filter(r => r.date === today);
        return {
          headers: ['Student ID', 'Student Name', 'Department', 'Sign In', 'Sign Out', 'Duration', 'Status', 'Geofence'],
          rows: records.map(r => [
            r.studentId,
            r.studentName || '',
            r.department || '',
            new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            r.signOutTime ? new Date(r.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Signed In',
            r.durationMinutes ? `${Math.floor(r.durationMinutes / 60)}h ${r.durationMinutes % 60}m` : 'In Session',
            r.status.toUpperCase(),
            r.isOutsideGeofence ? 'FLAGGED' : 'VALID',
          ]),
        };
      }
      case 'weekly': {
        const records = attendance.filter(r => r.date >= sevenDaysAgo);
        return {
          headers: ['Date', 'Student ID', 'Student Name', 'Department', 'Arrival Time', 'Status', 'Duration (Mins)'],
          rows: records.map(r => [
            r.date,
            r.studentId,
            r.studentName || '',
            r.department || '',
            new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            r.status.toUpperCase(),
            r.durationMinutes || '—',
          ]),
        };
      }
      case 'monthly': {
        const records = attendance.filter(r => r.date >= thirtyDaysAgo);
        return {
          headers: ['Date', 'Student ID', 'Student Name', 'Program', 'Status', 'Late?'],
          rows: records.map(r => [
            r.date,
            r.studentId,
            r.studentName || '',
            r.program || '',
            r.status.toUpperCase(),
            r.isLate ? 'YES' : 'NO',
          ]),
        };
      }
      case 'student': {
        const targetId = selectedStudentId === 'ALL' ? students[0]?.studentId : selectedStudentId;
        const records = attendance.filter(r => r.studentId === targetId);
        return {
          headers: ['Date', 'Student ID', 'Sign In Time', 'Location Site', 'Sign Out Time', 'Duration', 'Status'],
          rows: records.map(r => [
            r.date,
            r.studentId,
            new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            r.signInLocationName,
            r.signOutTime ? new Date(r.signOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
            r.durationMinutes ? `${r.durationMinutes} mins` : '—',
            r.status.toUpperCase(),
          ]),
        };
      }
      case 'leave': {
        return {
          headers: ['Student ID', 'Student Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Approver'],
          rows: leaves.map(l => [
            l.studentId,
            l.studentName,
            l.leaveType.toUpperCase(),
            l.startDate,
            l.endDate,
            l.totalDays,
            l.status.toUpperCase(),
            l.reviewedBy || 'Pending',
          ]),
        };
      }
      case 'program': {
        // Group by program
        const programs = Array.from(new Set(students.map(s => s.program)));
        return {
          headers: ['Academic Program', 'Total Enrolled', 'Total Sessions Logged', 'Late Incidence Rate'],
          rows: programs.map(p => {
            const enrolled = students.filter(s => s.program === p).length;
            const pAtt = attendance.filter(a => a.program === p);
            const lateCount = pAtt.filter(a => a.isLate).length;
            const lateRate = pAtt.length > 0 ? Math.round((lateCount / pAtt.length) * 100) : 0;
            return [p, enrolled, pAtt.length, `${lateRate}%`];
          }),
        };
      }
      case 'department': {
        return {
          headers: ['Department', 'Active Students', 'Total Attendance Logs', 'Compliance Rate'],
          rows: departments.map(d => {
            const enrolled = students.filter(s => s.department === d && s.status === 'active').length;
            const dAtt = attendance.filter(a => a.department === d);
            const present = dAtt.filter(a => a.status === 'present').length;
            const compRate = dAtt.length > 0 ? Math.round((present / dAtt.length) * 100) : 0;
            return [d, enrolled, dAtt.length, `${compRate}%`];
          }),
        };
      }
      case 'late': {
        const lateLogs = attendance.filter(r => r.isLate);
        return {
          headers: ['Date', 'Student ID', 'Student Name', 'Department', 'Sign-In Time', 'Location Site'],
          rows: lateLogs.map(r => [
            r.date,
            r.studentId,
            r.studentName || '',
            r.department || '',
            new Date(r.signInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            r.signInLocationName,
          ]),
        };
      }
      case 'absence': {
        const absentLogs = attendance.filter(r => r.status === 'absent');
        return {
          headers: ['Date', 'Student ID', 'Student Name', 'Department', 'Reason / Incident Status'],
          rows: absentLogs.map(r => [
            r.date,
            r.studentId,
            r.studentName || '',
            r.department || '',
            'Unexcused Absence (Flagged for Academic Warning)',
          ]),
        };
      }
      default:
        return { headers: [], rows: [] };
    }
  }, [selectedReport, attendance, students, leaves, selectedStudentId, departments]);

  const handleExportCSV = () => {
    exportToCSV(`report_${selectedReport}_${new Date().toISOString().split('T')[0]}`, reportData.headers, reportData.rows);
    showToast(`${reportTitles[selectedReport]} exported to CSV.`, 'success');
  };

  const handleExportExcel = () => {
    exportToExcel(`report_${selectedReport}_${new Date().toISOString().split('T')[0]}`, reportTitles[selectedReport], reportData.headers, reportData.rows);
    showToast(`${reportTitles[selectedReport]} exported to Excel spreadsheet.`, 'success');
  };

  const handlePrintPDF = () => {
    const meta = [
      { label: 'Report Name', value: reportTitles[selectedReport] },
      { label: 'Generated Date', value: new Date().toLocaleDateString() },
      { label: 'Total Records', value: String(reportData.rows.length) },
      { label: 'Generated By', value: currentUser.fullName },
    ];
    printFormattedReport(reportTitles[selectedReport], meta, reportData.headers, reportData.rows, language === 'ar');
  };

  const reportsList: { id: ReportType; label: string; desc: string }[] = [
    { id: 'daily', label: t.dailyReport, desc: 'Detailed log of today’s student attendance and active clinical shifts.' },
    { id: 'weekly', label: t.weeklyReport, desc: 'Weekly volume, arrival hours, and total recorded hours.' },
    { id: 'monthly', label: t.monthlyReport, desc: 'Full 30-day comprehensive student presence record.' },
    { id: 'student', label: t.studentReport, desc: 'Individual student timeline and clinical logs.' },
    { id: 'leave', label: t.leaveReport, desc: 'Historical approved, rejected, and medical leave requests.' },
    { id: 'program', label: t.programReport, desc: 'Academic program compliance and late arrivals.' },
    { id: 'department', label: t.deptReport, desc: 'Comparative attendance percentages across departments.' },
    { id: 'late', label: t.lateArrivalReport, desc: 'Chronological log of students checking in after 08:30 AM.' },
    { id: 'absence', label: t.absenceReport, desc: 'Unexcused absences requiring academic follow-up.' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navReports}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade attendance logs, departmental compliance digests, and institutional printable summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.exportExcel}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.exportPDF}</span>
          </button>
        </div>
      </div>

      {/* Reports Grid Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reportsList.map(rep => {
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {rep.label}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{rep.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Dynamic Sub-filter (for Student Report) */}
      {selectedReport === 'student' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">Select Student:</span>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-slate-800 font-medium"
          >
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>
                {s.fullName} ({s.studentId}) - {s.department}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Report Preview Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{reportTitles[selectedReport]}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live preview containing <strong className="font-mono text-slate-800">{reportData.rows.length}</strong> records.
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
              <tr>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-4 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length || 1} className="py-12 text-center text-slate-400">
                    No data records matching report parameters.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 text-slate-700 whitespace-nowrap font-mono text-[11px]">
                        {cell}
                      </td>
                    ))}
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
