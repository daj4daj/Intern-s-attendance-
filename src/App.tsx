/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/common/Layout';
import { ToastContainer } from './components/common/ToastContainer';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { AttendanceManagement } from './components/admin/AttendanceManagement';
import { LeaveApproval } from './components/admin/LeaveApproval';
import { LocationsManagement } from './components/admin/LocationsManagement';
import { ReportsSection } from './components/admin/ReportsSection';
import { AccountsManagement } from './components/admin/AccountsManagement';
import { AuditLogsSection } from './components/admin/AuditLogsSection';
import { AdminSettings } from './components/admin/AdminSettings';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { SignInOutPanel } from './components/student/SignInOutPanel';
import { MyAttendance } from './components/student/MyAttendance';
import { LeaveRequestForm } from './components/student/LeaveRequestForm';
import { MyLeaves } from './components/student/MyLeaves';
import { StudentProfile } from './components/student/StudentProfile';

function MainApp() {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<string>(() =>
    currentUser.role === 'admin' ? 'dashboard' : 'student-dashboard'
  );

  // If user role changes, switch to appropriate default tab
  useEffect(() => {
    if (currentUser.role === 'admin') {
      const studentTabs = ['student-dashboard', 'sign-in-out', 'my-attendance', 'request-leave', 'my-leaves', 'my-profile'];
      if (studentTabs.includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    } else {
      const adminTabs = ['dashboard', 'students', 'attendance', 'leaves', 'locations', 'reports', 'accounts', 'audit-logs', 'settings'];
      if (adminTabs.includes(currentTab)) {
        setCurrentTab('student-dashboard');
      }
    }
  }, [currentUser.role, currentTab]);

  const renderContent = () => {
    // Admin Views
    if (currentUser.role === 'admin') {
      switch (currentTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
        case 'students':
          return <StudentManagement />;
        case 'attendance':
          return <AttendanceManagement />;
        case 'leaves':
          return <LeaveApproval />;
        case 'locations':
          return <LocationsManagement />;
        case 'reports':
          return <ReportsSection />;
        case 'accounts':
          return <AccountsManagement />;
        case 'audit-logs':
          return <AuditLogsSection />;
        case 'settings':
          return <AdminSettings />;
        default:
          return <AdminDashboard onNavigateTab={setCurrentTab} />;
      }
    }

    // Student Views
    switch (currentTab) {
      case 'student-dashboard':
        return <StudentDashboard onNavigateTab={setCurrentTab} />;
      case 'sign-in-out':
        return <SignInOutPanel />;
      case 'my-attendance':
        return <MyAttendance />;
      case 'request-leave':
        return <LeaveRequestForm onSuccess={() => setCurrentTab('my-leaves')} />;
      case 'my-leaves':
        return <MyLeaves />;
      case 'my-profile':
        return <StudentProfile />;
      default:
        return <StudentDashboard onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderContent()}
      <ToastContainer />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
