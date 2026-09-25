import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../services/storage';
import { User } from '../../types';
import { UserCheck, UserPlus, Shield, X, Lock } from 'lucide-react';

export const AccountsManagement: React.FC = () => {
  const { t, showToast, refreshData, currentUser } = useApp();
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'student'>('admin');

  const reload = () => {
    setUsers(storage.getUsers());
    refreshData();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername || !formFullName || !formEmail) {
      showToast('All fields are required.', 'error');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === formUsername.toLowerCase())) {
      showToast('Username already in use.', 'error');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: formUsername.trim(),
      fullName: formFullName.trim(),
      email: formEmail.trim(),
      role: formRole,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    storage.saveUser(newUser);
    storage.addAuditLog({
      action: 'ADMIN_ACCOUNT_CREATED',
      performedBy: currentUser.fullName,
      performerRole: 'admin',
      targetType: 'admin',
      targetId: newUser.id,
      details: `Created new ${formRole} user account for ${newUser.fullName} (${newUser.username}).`,
    });

    showToast(`Account for ${newUser.fullName} created successfully.`, 'success');
    setIsAddOpen(false);
    setFormUsername('');
    setFormFullName('');
    setFormEmail('');
    reload();
  };

  const toggleUserStatus = (u: User) => {
    if (u.id === currentUser.id) {
      showToast('You cannot deactivate your own current active session.', 'error');
      return;
    }
    u.status = u.status === 'active' ? 'inactive' : 'active';
    storage.saveUser(u);
    storage.addAuditLog({
      action: 'USER_STATUS_TOGGLED',
      performedBy: currentUser.fullName,
      performerRole: 'admin',
      targetType: 'admin',
      targetId: u.id,
      details: `Set status of user ${u.username} to ${u.status}.`,
    });
    showToast(`Status changed for ${u.fullName}.`, 'info');
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.navAccounts}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative personnel, grant supervisory credentials, and review system access roles.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create Admin / User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Username</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 font-medium">@{u.username}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.role === 'admin' ? t.adminRole : t.studentRole}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                      {u.status === 'active' ? t.active : t.inactive}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserStatus(u)}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded transition-colors ${
                          u.status === 'active'
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Create New Account</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  placeholder="e.g. Dr. Rayan Al-Fahad"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="r.alfahad"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                  >
                    <option value="admin">Administrator</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="r.alfahad@institution.edu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px]">
                A default secure temporary password invitation will be generated.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
