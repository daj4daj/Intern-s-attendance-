import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { Student } from '../../types';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Download } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ParsedRecord {
  studentId: string;
  fullName: string;
  email: string;
  mobile: string;
  department: string;
  supervisor: string;
  program: string;
  status: 'active' | 'inactive';
  isValid: boolean;
  errors: string[];
  isUpdate: boolean;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const { t, showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRecord[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'summary'>('upload');
  const [summary, setSummary] = useState<{ imported: number; updated: number; failed: number } | null>(null);

  if (!isOpen) return null;

  const downloadSampleCSV = () => {
    const csvContent =
      'Student ID,Full Name,Email,Mobile,Department,Program,Supervisor,Status\n' +
      'STU-2024-009,Nasser Al-Ghamdi,nasser.ghamdi@student.edu,+966 50 111 2233,Medicine & Surgery,Bachelor of Medicine & Surgery (MBBS),Dr. H. Vance,active\n' +
      'STU-2024-010,Sarah Al-Juhani,sarah.juhani@student.edu,+966 55 999 8877,Clinical Pharmacy,Doctor of Pharmacy (PharmD),Dr. Noura Al-Ghamdi,active\n' +
      'STU-2024-011,Khaled Al-Dossari,khaled.dossari@student.edu,+966 54 333 4411,Nursing & Critical Care,Bachelor of Science in Nursing,Prof. L. Jenkins,active\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    parseCSV(uploadedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

      if (lines.length <= 1) {
        showToast('CSV file is empty or missing headers.', 'error');
        return;
      }

      // Existing student IDs in database
      const existingStudents = storage.getStudents();
      const existingMap = new Map(existingStudents.map(s => [s.studentId.trim().toUpperCase(), s]));

      const seenInFile = new Set<string>();
      const results: ParsedRecord[] = [];

      // Parse data rows (skip header row 0)
      for (let i = 1; i < lines.length; i++) {
        const rawRow = lines[i];
        // Split with basic comma handling
        const parts = rawRow.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length < 5) continue;

        const studentId = parts[0] || '';
        const fullName = parts[1] || '';
        const email = parts[2] || '';
        const mobile = parts[3] || '';
        const department = parts[4] || '';
        const program = parts[5] || 'General Academic';
        const supervisor = parts[6] || 'Unassigned';
        const rawStatus = (parts[7] || 'active').toLowerCase();
        const status: 'active' | 'inactive' = rawStatus === 'inactive' ? 'inactive' : 'active';

        const errors: string[] = [];

        // Validations
        if (!studentId) errors.push('Student ID is required');
        if (!fullName) errors.push('Full Name is required');
        if (!email) {
          errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push('Invalid email format');
        }
        if (!department) errors.push('Department is required');

        const upperId = studentId.toUpperCase();
        if (seenInFile.has(upperId)) {
          errors.push(`Duplicate ID within this file (${studentId})`);
        } else {
          seenInFile.add(upperId);
        }

        const isUpdate = existingMap.has(upperId);

        results.push({
          studentId,
          fullName,
          email,
          mobile,
          department,
          program,
          supervisor,
          status,
          isValid: errors.length === 0,
          errors,
          isUpdate,
        });
      }

      setParsedData(results);
      setStep('preview');
    };

    reader.readAsText(file);
  };

  const executeImport = () => {
    let imported = 0;
    let updated = 0;
    let failed = 0;

    const validRecords = parsedData.filter(d => d.isValid);

    validRecords.forEach(item => {
      const studentData: Student = {
        id: `stu-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: item.studentId,
        fullName: item.fullName,
        email: item.email,
        mobile: item.mobile,
        department: item.department,
        program: item.program,
        supervisor: item.supervisor,
        status: item.status,
        createdAt: new Date().toISOString(),
      };

      if (item.isUpdate) {
        updated++;
      } else {
        imported++;
      }

      storage.saveStudent(studentData, 'Bulk Importer');
    });

    failed = parsedData.length - validRecords.length;

    storage.addAuditLog({
      action: 'BULK_IMPORT',
      performedBy: 'Administrator',
      performerRole: 'admin',
      targetType: 'bulk_import',
      details: `Bulk import executed: ${imported} created, ${updated} updated, ${failed} failed validation.`,
    });

    setSummary({ imported, updated, failed });
    setStep('summary');
    onImportComplete();
  };

  const validCount = parsedData.filter(p => p.isValid).length;
  const errorCount = parsedData.filter(p => !p.isValid).length;
  const updateCount = parsedData.filter(p => p.isValid && p.isUpdate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">{t.bulkImportTitle}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 mb-1">{t.dragAndDrop}</p>
                <p className="text-slate-400 text-xs mb-4">Supported formats: .csv, .txt (comma-separated)</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                  <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h4 className="font-semibold text-slate-800">Need a template?</h4>
                  <p className="text-slate-500">Download our pre-formatted CSV template with standard fields.</p>
                </div>
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.downloadSampleTemplate}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Validation Summary Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold">{t.validRecords}</span>
                    <p className="text-lg font-bold font-mono text-emerald-900">{validCount}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="text-[10px] text-amber-700 uppercase font-bold">Existing Updates</span>
                    <p className="text-lg font-bold font-mono text-amber-900">{updateCount}</p>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <div>
                    <span className="text-[10px] text-rose-700 uppercase font-bold">{t.invalidRecords}</span>
                    <p className="text-lg font-bold font-mono text-rose-900">{errorCount}</p>
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5 font-semibold">Status</th>
                      <th className="p-2.5 font-semibold">Student ID</th>
                      <th className="p-2.5 font-semibold">Full Name</th>
                      <th className="p-2.5 font-semibold">Email</th>
                      <th className="p-2.5 font-semibold">Department</th>
                      <th className="p-2.5 font-semibold">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-medium">Valid</span>
                          ) : (
                            <span className="text-rose-700 font-bold">Failed</span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-slate-800">{row.studentId}</td>
                        <td className="p-2.5 text-slate-900 font-sans">{row.fullName}</td>
                        <td className="p-2.5 text-slate-600">{row.email}</td>
                        <td className="p-2.5 text-slate-600 font-sans">{row.department}</td>
                        <td className="p-2.5 font-sans">
                          {row.isValid ? (
                            <span className="text-slate-400">{row.isUpdate ? 'Will update existing' : 'New student'}</span>
                          ) : (
                            <span className="text-rose-600">{row.errors.join(', ')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'summary' && summary && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.importSuccessMsg}</h3>
                <p className="text-slate-500 mt-1">Student database has been successfully updated.</p>
              </div>

              <div className="inline-grid grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Newly Added</div>
                  <div className="text-xl font-bold font-mono text-emerald-600">{summary.imported}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Updated</div>
                  <div className="text-xl font-bold font-mono text-indigo-600">{summary.updated}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Skipped/Failed</div>
                  <div className="text-xl font-bold font-mono text-slate-400">{summary.failed}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          {step === 'preview' ? (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-3 py-1.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-white"
              >
                Back
              </button>
              <button
                disabled={validCount === 0}
                onClick={executeImport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                {t.importNow} ({validCount})
              </button>
            </>
          ) : step === 'summary' ? (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium">
                {t.cancel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
