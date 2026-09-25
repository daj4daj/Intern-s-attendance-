import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, Bell, AlertTriangle, CalendarCheck, ShieldAlert, Info } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadNotifsCount, markNotificationRead, markAllNotificationsRead, t, language } = useApp();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  if (!isOpen) return null;

  const displayedNotifs = filterUnreadOnly
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getIcon = (type: AppNotification['notificationType']) => {
    switch (type) {
      case 'geofence_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'leave_status':
      case 'leave_submitted':
        return <CalendarCheck className="w-4 h-4 text-indigo-500" />;
      case 'attendance_flag':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-700" />
            <h2 className="text-base font-semibold text-slate-900">{t.notifications}</h2>
            {unreadNotifsCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {unreadNotifsCount} {t.unread}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterUnreadOnly ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filterUnreadOnly ? 'Showing Unread' : 'All'}
            </button>
          </div>
          {unreadNotifsCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t.markAllRead}</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {displayedNotifs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>{t.noNotifications}</p>
            </div>
          ) : (
            displayedNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                  notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                }`}
              >
                <div className="p-2 bg-slate-100 rounded-lg shrink-0 self-start mt-0.5">
                  {getIcon(notif.notificationType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs ${notif.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
