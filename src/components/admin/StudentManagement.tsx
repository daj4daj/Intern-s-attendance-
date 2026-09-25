import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { Student } from '../../types';
import {
  Users,
  UserPlus,
  Upload,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit2,
  Trash2,
  Lock,
  UserX,
  UserCheck,
  X,
  Check
} from 'lucide-react';
import { BulkImportModal } from './BulkImportModal';
import { exportToCSV } from '../../services/export';

export const StudentManagement: React.FC = () => {
  const { t, showToast, refreshData } = useApp();
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<Student | null>(null);

  // Form fields
  const [formStudentId, setFormStudentId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formDepartment, setFormDepartment] = useState('Medicine & Surgery');
  const [formProgram, setFormProgram] = useState('Bachelor of Medicine & Surgery (MBBS)');
  const [formSupervisor, setFormSupervisor] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const reloadStudents = () => {
    setStudents(storage.getStudents());
    refreshData();
  };

  const departments = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.department)));
    return list.sort();
  }, [students]);

  const programs = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.program)));
    return list.sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch =
        searchQuery === '' ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesProg = programFilter === 'ALL' || s.program === programFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesProg;
    });
  }, [students, searchQuery, deptFilter, statusFilter, programFilter]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormStudentId(`STU-2024-${String(students.length + 1).padStart(3, '0')}`);
    setFormFullName('');
    setFormEmail('');
    setFormMobile('+966 50 ');
    setFormDepartment('Medicine & Surgery');
    setFormProgram('Bachelor of Medicine & Surgery (MBBS)');
    setFormSupervisor('Dr. H. Vance, MD');
    setFormStatus('active');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormStudentId(student.studentId);
    setFormFullName(student.fullName);
    setFormEmail(student.email);
    setFormMobile(student.mobile);
    setFormDepartment(student.department);
    setFormProgram(student.program);
    setFormSupervisor(student.supervisor);
    setFormStatus(student.status);
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName || !formEmail || !formStudentId) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    const payload: Student = {
      id: editingStudent ? editingStudent.id : `stu-${Date.now()}`,
      studentId: formStudentId.trim(),
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      mobile: formMobile.trim(),
      department: formDepartment,
      program: formProgram,
      supervisor: formSupervisor.trim() || 'Unassigned',
      status: formStatus,
      createdAt: editingStudent ? editingStudent.createdAt : new Date().toISOString(),
    };

    const saved = storage.saveStudent(payload, 'Administrator');
    if (!saved && !editingStudent) {
      showToast(`Student ID ${payload.studentId} already exists!`, 'error');
      return;
    }

    showToast(editingStudent ? 'Student details updated.' : 'Student registered successfully.', 'success');
    setIsAddEditModalOpen(false);
    reloadStudents();
  };

  const handleToggleStatus = (student: Student) => {
    storage.deactivateStudent(student.studentId, 'Administrator');
    showToast(`Status changed for ${student.fullName}.`, 'info');
    reloadStudents();
  };

  const handleDelete = (student: Student) => {
    if (confirm(`${t.confirmDelete} (${student.fullName})`)) {
      storage.deleteStudent(student.studentId, 'Administrator');
      showToast('Student record deleted.', 'warning');
      reloadStudents();
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Mobile',
      'Department',
      'Program',
      'Supervisor',
      'Status',
      'Enrolled Date',
    ];
    const rows = filteredStudents.map(s => [
      s.studentId,
      s.fullName,
      s.email,
      s.mobile,
      s.department,
      s.program,
      s.supervisor,
      s.status,
      new Date(s.createdAt).toLocaleDateString(),
    ]);
    exportToCSV(`students_registry_${new Date().toISOString().split('T')[0]}`, headers, rows);
    showToast('Students list exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navStudents}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic enrollments, field supervisors, account states, and records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.bulkImport}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.exportData}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.addStudent}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchStudent}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-xs text-slate-700"
            >
              <option value="ALL">{t.allDepartments}</option>
              {departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-xs text-slate-700"
            >
              <option value="ALL">{t.allPrograms}</option>
              {programs.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden text-xs text-slate-700"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
            </select>

            {(searchQuery || deptFilter !== 'ALL' || statusFilter !== 'ALL' || programFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDeptFilter('ALL');
                  setStatusFilter('ALL');
                  setProgramFilter('ALL');
                }}
                className="px-2.5 py-2 text-slate-500 hover:text-slate-800 text-[11px] font-medium whitespace-nowrap"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>

        {/* Total records found */}
        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
          <span>
            Showing <strong className="font-mono text-slate-800">{filteredStudents.length}</strong> of{' '}
            <strong className="font-mono text-slate-800">{students.length}</strong> students
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">{t.studentId}</th>
                <th className="py-3 px-4 font-semibold">{t.fullName}</th>
                <th className="py-3 px-4 font-semibold">{t.department}</th>
                <th className="py-3 px-4 font-semibold">{t.supervisor}</th>
                <th className="py-3 px-4 font-semibold">{t.status}</th>
                <th className="py-3 px-4 font-semibold">{t.creationDate}</th>
                <th className="py-3 px-4 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {student.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{student.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{student.department}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[220px]">{student.program}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {student.supervisor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                          student.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        />
                        {student.status === 'active' ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(student)}
                          title={t.edit}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          title={student.status === 'active' ? t.deactivate : t.activate}
                          className={`p-1.5 rounded-md transition-colors ${
                            student.status === 'active'
                              ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {student.status === 'active' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setResetPasswordStudent(student)}
                          title={t.resetPassword}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          title={t.delete}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingStudent ? `${t.edit}: ${editingStudent.fullName}` : t.addStudent}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.studentId} *</label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    disabled={!!editingStudent}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.status}</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                  >
                    <option value="active">{t.active}</option>
                    <option value="inactive">{t.inactive}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fullName} *</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  placeholder="e.g. Omar Farooq"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.email} *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.mobile}</label>
                  <input
                    type="text"
                    value={formMobile}
                    onChange={e => setFormMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.department} *</label>
                  <input
                    type="text"
                    required
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.supervisor}</label>
                  <input
                    type="text"
                    value={formSupervisor}
                    onChange={e => setFormSupervisor(e.target.value)}
                    placeholder="e.g. Dr. H. Vance, MD"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.program}</label>
                <input
                  type="text"
                  value={formProgram}
                  onChange={e => setFormProgram(e.target.value)}
                  placeholder="e.g. Bachelor of Medicine & Surgery"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal Simulation */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-xs text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t.resetPassword}</h3>
              <p className="text-slate-500 mt-1">
                A temporary password reset link will be dispatched to{' '}
                <strong className="text-slate-800">{resetPasswordStudent.email}</strong>.
              </p>
            </div>
            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-700 select-all">
              Temporary Pin: <span className="font-bold">SAAMS-9482</span>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setResetPasswordStudent(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  showToast(`Password reset link sent to ${resetPasswordStudent.email}`, 'success');
                  storage.addAuditLog({
                    action: 'PASSWORD_RESET_DISPATCHED',
                    performedBy: 'Administrator',
                    performerRole: 'admin',
                    targetType: 'student',
                    targetId: resetPasswordStudent.studentId,
                    details: `Password reset dispatched for ${resetPasswordStudent.fullName}.`,
                  });
                  setResetPasswordStudent(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={reloadStudents}
      />
    </div>
  );
};
