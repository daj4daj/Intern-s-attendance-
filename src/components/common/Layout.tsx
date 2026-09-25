import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck2,
  MapPin,
  FileBarChart2,
  Bell,
  ShieldAlert,
  UserCheck,
  Settings,
  LogOut,
  Globe,
  Menu,
  X,
  UserCircle,
  FileText,
  CalendarDays,
  Send,
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';
import { storage } from '../../services/storage';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

interface LayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentTab, onTabChange, children }) => {
  const { currentUser, language, setLanguage, t, unreadNotifsCount, switchUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const allUsers = storage.getUsers();

  const adminNavItems = [
    { id: 'dashboard', label: t.navAdminDashboard, icon: LayoutDashboard },
    { id: 'students', label: t.navStudents, icon: Users },
    { id: 'attendance', label: t.navAttendance, icon: Clock },
    { id: 'leaves', label: t.navLeaveRequests, icon: CalendarCheck2 },
    { id: 'locations', label: t.navLocations, icon: MapPin },
    { id: 'reports', label: t.navReports, icon: FileBarChart2 },
    { id: 'accounts', label: t.navAccounts, icon: UserCheck },
    { id: 'audit-logs', label: t.navAuditLogs, icon: ShieldAlert },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  const studentNavItems = [
    { id: 'student-dashboard', label: t.navStudentDashboard, icon: LayoutDashboard },
    { id: 'sign-in-out', label: t.navSignInOut, icon: Clock },
    { id: 'my-attendance', label: t.navMyAttendance, icon: CalendarDays },
    { id: 'request-leave', label: t.navRequestLeave, icon: Send },
    { id: 'my-leaves', label: t.navMyLeaves, icon: FileText },
    { id: 'my-profile', label: t.navMyProfile, icon: UserCircle },
  ];

  const navItems = currentUser.role === 'admin' ? adminNavItems : studentNavItems;

  const currentTabLabel = navItems.find(i => i.id === currentTab)?.label || t.navAdminDashboard;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
        {/* Brand header */}
        <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            S
          </div>
          <div className="truncate">
            <h1 className="text-sm font-semibold text-white tracking-tight truncate leading-tight">
              SAAMS Portal
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser.role === 'admin' ? 'Administrative Hub' : 'Student Portal'}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {currentUser.role === 'admin' ? 'Administration' : 'Student Activities'}
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Role Switcher Pill in Sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="text-[11px] text-slate-400 mb-2 font-medium flex items-center justify-between">
            <span>{t.switchRole}</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            {allUsers.slice(0, 4).map(u => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u);
                  onTabChange(u.role === 'admin' ? 'dashboard' : 'student-dashboard');
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                  currentUser.id === u.id
                    ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-700/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="truncate max-w-[140px]">{u.fullName}</span>
                <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                  {u.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          {/* Left Zone: Mobile toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 hidden sm:inline">SAAMS</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-semibold text-slate-900">{currentTabLabel}</span>
            </div>
          </div>

          {/* Right Zone: Language, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Toggle Language / تبديل اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifDrawerOpen(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={t.notifications}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-medium text-xs flex items-center justify-center ring-2 ring-indigo-500/30">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {currentUser.role === 'admin' ? t.adminRole : t.studentRole}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-30 text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    {currentUser.studentId && (
                      <p className="text-indigo-600 font-mono text-[10px] mt-0.5">
                        ID: {currentUser.studentId}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                      {t.switchRole}
                    </div>
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          onTabChange(u.role === 'admin' ? 'dashboard' : 'student-dashboard');
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                          u.id === currentUser.id ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{u.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-mono capitalize">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        const otherRoleUser = allUsers.find(u => u.role !== currentUser.role);
                        if (otherRoleUser) {
                          switchUser(otherRoleUser);
                          onTabChange(otherRoleUser.role === 'admin' ? 'dashboard' : 'student-dashboard');
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.switchRole} ({currentUser.role === 'admin' ? 'Student View' : 'Admin View'})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-slate-200 border-b border-slate-800 p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left ${
                    isActive ? 'bg-indigo-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />
    </div>
  );
};
