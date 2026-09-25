export type UserRole = 'admin' | 'student';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  email: string;
  studentId?: string; // Links to Student if role is student
  avatarUrl?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2024-001"
  fullName: string;
  email: string;
  mobile: string;
  department: string;
  program: string; // e.g. "Bachelor of Medicine", "Pharmacy Practice", "Clinical Nursing"
  supervisor: string;
  status: 'active' | 'inactive';
  createdAt: string;
  leaveBalance?: {
    annualTotal: number;
    annualUsed: number;
    sickTotal: number;
    sickUsed: number;
    educationalTotal: number;
    educationalUsed: number;
  };
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  department?: string;
  program?: string;
  date: string; // YYYY-MM-DD
  signInTime: string; // ISO string
  signInLatitude?: number;
  signInLongitude?: number;
  signInLocationName: string;
  signOutTime?: string | null; // ISO string
  signOutLatitude?: number;
  signOutLongitude?: number;
  signOutLocationName?: string | null;
  durationMinutes?: number | null; // minutes
  status: AttendanceStatus;
  isLate: boolean;
  isOutsideGeofence: boolean;
  deviceInfo?: string;
  modifiedByAdmin?: boolean;
  adminNote?: string;
  createdAt: string;
}

export type LeaveType = 'annual' | 'sick' | 'educational' | 'urgent';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'info_requested';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  educationalActivity?: string; // for educational leave
  emergencyDescription?: string; // for urgent leave
  attachmentName?: string;
  attachmentSize?: string;
  attachmentDataUrl?: string;
  status: LeaveStatus;
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface LocationSite {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  address: string;
  status: 'active' | 'inactive';
}

export type NotificationType = 'leave_submitted' | 'leave_status' | 'geofence_alert' | 'system' | 'attendance_flag';

export interface AppNotification {
  id: string;
  userId: string; // "all_admins" or specific userId / studentId
  title: string;
  message: string;
  notificationType: NotificationType;
  isRead: boolean;
  referenceId?: string; // e.g. leaveRequestId
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  performerRole: string;
  targetType: 'student' | 'attendance' | 'leave' | 'location' | 'admin' | 'bulk_import';
  targetId?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface GlobalFilterState {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  department: string;
  program: string;
  studentQuery: string;
  status: string;
}

export type Language = 'en' | 'ar';
