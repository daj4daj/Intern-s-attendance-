import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Student, AppNotification, Language } from '../types';
import { storage } from '../services/storage';
import { translations } from '../translations';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  currentUser: User;
  currentStudent: Student | null;
  language: Language;
  t: typeof translations.en;
  notifications: AppNotification[];
  unreadNotifsCount: number;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  switchUser: (user: User) => void;
  setLanguage: (lang: Language) => void;
  refreshData: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [language, setLanguageState] = useState<Language>(() => storage.getLanguage());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  // Sync current student profile if user is a student
  const currentStudent = currentUser.role === 'student' && currentUser.studentId
    ? storage.getStudentById(currentUser.studentId) || null
    : null;

  const refreshData = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  // Update notifications when currentUser or dataVersion changes
  useEffect(() => {
    const notifs = storage.getNotifications(currentUser.role === 'admin' ? undefined : currentUser.studentId);
    setNotifications(notifs);
  }, [currentUser, dataVersion]);

  // Set HTML dir attribute whenever language changes
  useEffect(() => {
    storage.setLanguage(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.setLanguage(lang);
  };

  const switchUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`Switched account to ${user.fullName} (${user.role === 'admin' ? 'Administrator' : 'Student'})`, 'info');
    refreshData();
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markNotificationRead = (id: string) => {
    storage.markNotificationAsRead(id);
    refreshData();
  };

  const markAllNotificationsRead = () => {
    storage.markAllNotificationsAsRead(currentUser.role === 'admin' ? undefined : currentUser.studentId);
    refreshData();
  };

  const resetAllDemoData = () => {
    storage.resetAllData();
    setCurrentUser(storage.getCurrentUser());
    showToast('Demo data reset to initial default state.', 'info');
    refreshData();
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;
  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentStudent,
        language,
        t,
        notifications,
        unreadNotifsCount,
        toasts,
        showToast,
        removeToast,
        switchUser,
        setLanguage,
        refreshData,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
