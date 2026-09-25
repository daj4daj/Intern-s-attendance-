import {
  Student,
  AttendanceRecord,
  LeaveRequest,
  LocationSite,
  AppNotification,
  AuditLogEntry,
  User
} from '../types';

const STORAGE_KEYS = {
  USERS: 'saams_users_v1',
  STUDENTS: 'saams_students_v1',
  ATTENDANCE: 'saams_attendance_v1',
  LEAVES: 'saams_leaves_v1',
  LOCATIONS: 'saams_locations_v1',
  NOTIFICATIONS: 'saams_notifications_v1',
  AUDIT_LOGS: 'saams_audit_logs_v1',
  CURRENT_USER: 'saams_current_user_v1',
  LANGUAGE: 'saams_lang_v1',
};

// Calculate distance in meters using Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Initial Mock Locations
const DEFAULT_LOCATIONS: LocationSite[] = [
  {
    id: 'loc-1',
    locationName: 'Main Training Hospital',
    latitude: 24.7136,
    longitude: 46.6753,
    allowedRadiusMeters: 150,
    address: 'King Abdulaziz Medical City, Building A',
    status: 'active',
  },
  {
    id: 'loc-2',
    locationName: 'Health Sciences College Campus',
    latitude: 24.7250,
    longitude: 46.6850,
    allowedRadiusMeters: 200,
    address: 'Academic Wing 3, Clinical Simulation Labs',
    status: 'active',
  },
  {
    id: 'loc-3',
    locationName: 'Biomedical Innovation Research Complex',
    latitude: 24.7350,
    longitude: 46.6950,
    allowedRadiusMeters: 100,
    address: 'Research Park Blvd, Tower 2',
    status: 'active',
  },
];

// Initial Users
const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    role: 'admin',
    status: 'active',
    fullName: 'Dr. Sarah Al-Mansoor',
    email: 's.almansoor@institution.edu',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user-admin-2',
    username: 'director.khalid',
    role: 'admin',
    status: 'active',
    fullName: 'Prof. Khalid Al-Otaibi',
    email: 'k.alotaibi@institution.edu',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'user-stu-1',
    username: 'omar.farooq',
    role: 'student',
    status: 'active',
    fullName: 'Omar Farooq',
    email: 'omar.farooq@student.edu',
    studentId: 'STU-2024-001',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'user-stu-2',
    username: 'fatima.zahra',
    role: 'student',
    status: 'active',
    fullName: 'Fatima Zahra',
    email: 'fatima.zahra@student.edu',
    studentId: 'STU-2024-002',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'user-stu-3',
    username: 'zaid.malik',
    role: 'student',
    status: 'active',
    fullName: 'Zaid Malik',
    email: 'zaid.malik@student.edu',
    studentId: 'STU-2024-003',
    createdAt: '2026-03-01T10:00:00Z',
  },
];

// Initial Students
const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    studentId: 'STU-2024-001',
    fullName: 'Omar Farooq',
    email: 'omar.farooq@student.edu',
    mobile: '+966 50 123 4567',
    department: 'Medicine & Surgery',
    program: 'Bachelor of Medicine & Surgery (MBBS)',
    supervisor: 'Dr. H. Vance, MD',
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 4,
      sickTotal: 14,
      sickUsed: 2,
      educationalTotal: 7,
      educationalUsed: 3,
    },
  },
  {
    id: 'stu-2',
    studentId: 'STU-2024-002',
    fullName: 'Fatima Zahra',
    email: 'fatima.zahra@student.edu',
    mobile: '+966 54 987 6543',
    department: 'Clinical Pharmacy',
    program: 'Doctor of Pharmacy (PharmD)',
    supervisor: 'Dr. Noura Al-Ghamdi',
    status: 'active',
    createdAt: '2026-01-12T11:00:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 2,
      sickTotal: 14,
      sickUsed: 0,
      educationalTotal: 7,
      educationalUsed: 1,
    },
  },
  {
    id: 'stu-3',
    studentId: 'STU-2024-003',
    fullName: 'Zaid Malik',
    email: 'zaid.malik@student.edu',
    mobile: '+966 55 456 7890',
    department: 'Nursing & Critical Care',
    program: 'Bachelor of Science in Nursing',
    supervisor: 'Prof. L. Jenkins',
    status: 'active',
    createdAt: '2026-01-15T14:30:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 5,
      sickTotal: 14,
      sickUsed: 3,
      educationalTotal: 7,
      educationalUsed: 0,
    },
  },
  {
    id: 'stu-4',
    studentId: 'STU-2024-004',
    fullName: 'Mariam Al-Harbi',
    email: 'mariam.harbi@student.edu',
    mobile: '+966 56 333 4455',
    department: 'Medicine & Surgery',
    program: 'Bachelor of Medicine & Surgery (MBBS)',
    supervisor: 'Dr. H. Vance, MD',
    status: 'active',
    createdAt: '2026-01-18T09:15:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 1,
      sickTotal: 14,
      sickUsed: 1,
      educationalTotal: 7,
      educationalUsed: 2,
    },
  },
  {
    id: 'stu-5',
    studentId: 'STU-2024-005',
    fullName: 'Abdullah Al-Shehri',
    email: 'abdullah.shehri@student.edu',
    mobile: '+966 53 222 1100',
    department: 'Health Informatics',
    program: 'MSc Health Data Analytics',
    supervisor: 'Dr. Tariq Al-Bishi',
    status: 'active',
    createdAt: '2026-01-20T10:00:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 0,
      sickTotal: 14,
      sickUsed: 0,
      educationalTotal: 7,
      educationalUsed: 0,
    },
  },
  {
    id: 'stu-6',
    studentId: 'STU-2024-006',
    fullName: 'Rana Al-Mutawa',
    email: 'rana.mutawa@student.edu',
    mobile: '+966 50 888 9911',
    department: 'Clinical Pharmacy',
    program: 'Doctor of Pharmacy (PharmD)',
    supervisor: 'Dr. Noura Al-Ghamdi',
    status: 'active',
    createdAt: '2026-01-22T13:45:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 3,
      sickTotal: 14,
      sickUsed: 1,
      educationalTotal: 7,
      educationalUsed: 1,
    },
  },
  {
    id: 'stu-7',
    studentId: 'STU-2024-007',
    fullName: 'Hassan Al-Amoudi',
    email: 'hassan.amoudi@student.edu',
    mobile: '+966 54 112 3344',
    department: 'Radiology & Medical Imaging',
    program: 'BSc Diagnostic Radiography',
    supervisor: 'Dr. Emily Carter',
    status: 'active',
    createdAt: '2026-01-25T08:30:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 6,
      sickTotal: 14,
      sickUsed: 4,
      educationalTotal: 7,
      educationalUsed: 0,
    },
  },
  {
    id: 'stu-8',
    studentId: 'STU-2024-008',
    fullName: 'Layla Al-Khatib',
    email: 'layla.khatib@student.edu',
    mobile: '+966 59 777 6655',
    department: 'Nursing & Critical Care',
    program: 'Bachelor of Science in Nursing',
    supervisor: 'Prof. L. Jenkins',
    status: 'inactive',
    createdAt: '2026-01-28T16:00:00Z',
    leaveBalance: {
      annualTotal: 21,
      annualUsed: 0,
      sickTotal: 14,
      sickUsed: 0,
      educationalTotal: 7,
      educationalUsed: 0,
    },
  }
];

// Helper to format date YYYY-MM-DD
function getDateString(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Generate realistic historical attendance records for the past 2 weeks
function generateDefaultAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = getDateString(0);
  const yesterday = getDateString(-1);
  const twoDaysAgo = getDateString(-2);
  const threeDaysAgo = getDateString(-3);

  // Today's records
  // Omar: currently signed in!
  records.push({
    id: 'att-today-1',
    studentId: 'STU-2024-001',
    studentName: 'Omar Farooq',
    department: 'Medicine & Surgery',
    program: 'Bachelor of Medicine & Surgery (MBBS)',
    date: today,
    signInTime: `${today}T07:45:00Z`,
    signInLatitude: 24.7138,
    signInLongitude: 46.6755,
    signInLocationName: 'Main Training Hospital (Clinical Lab A)',
    signOutTime: null,
    durationMinutes: null,
    status: 'present',
    isLate: false,
    isOutsideGeofence: false,
    deviceInfo: 'Chrome on macOS (Darwin)',
    createdAt: `${today}T07:45:00Z`,
  });

  // Fatima: currently signed in, arrived slightly late
  records.push({
    id: 'att-today-2',
    studentId: 'STU-2024-002',
    studentName: 'Fatima Zahra',
    department: 'Clinical Pharmacy',
    program: 'Doctor of Pharmacy (PharmD)',
    date: today,
    signInTime: `${today}T08:35:00Z`,
    signInLatitude: 24.7252,
    signInLongitude: 46.6853,
    signInLocationName: 'Health Sciences College Campus',
    signOutTime: null,
    durationMinutes: null,
    status: 'late',
    isLate: true,
    isOutsideGeofence: false,
    deviceInfo: 'Safari on iPhone (iOS 18)',
    createdAt: `${today}T08:35:00Z`,
  });

  // Zaid: signed in and signed out already
  records.push({
    id: 'att-today-3',
    studentId: 'STU-2024-003',
    studentName: 'Zaid Malik',
    department: 'Nursing & Critical Care',
    program: 'Bachelor of Science in Nursing',
    date: today,
    signInTime: `${today}T07:15:00Z`,
    signInLatitude: 24.7135,
    signInLongitude: 46.6751,
    signInLocationName: 'Main Training Hospital (ICU Ward 4)',
    signOutTime: `${today}T15:20:00Z`,
    signOutLatitude: 24.7134,
    signOutLongitude: 46.6752,
    signOutLocationName: 'Main Training Hospital',
    durationMinutes: 485,
    status: 'present',
    isLate: false,
    isOutsideGeofence: false,
    deviceInfo: 'Chrome on Windows 11',
    createdAt: `${today}T07:15:00Z`,
  });

  // Mariam: signed in with geofence exception flagged
  records.push({
    id: 'att-today-4',
    studentId: 'STU-2024-004',
    studentName: 'Mariam Al-Harbi',
    department: 'Medicine & Surgery',
    program: 'Bachelor of Medicine & Surgery (MBBS)',
    date: today,
    signInTime: `${today}T08:05:00Z`,
    signInLatitude: 24.7190, // ~600m away
    signInLongitude: 46.6790,
    signInLocationName: 'Near Outpatient Pavilion (Outside Radius: 580m)',
    signOutTime: null,
    durationMinutes: null,
    status: 'present',
    isLate: false,
    isOutsideGeofence: true,
    deviceInfo: 'Edge on Android 15',
    adminNote: 'Flagged for location exception review',
    createdAt: `${today}T08:05:00Z`,
  });

  // Past days records to feed analytics & monthly calendar
  for (let i = 1; i <= 20; i++) {
    const dStr = getDateString(-i);
    const dayOfWeek = new Date(dStr).getDay();
    // Skip Friday/Saturday weekend
    if (dayOfWeek === 5 || dayOfWeek === 6) continue;

    DEFAULT_STUDENTS.forEach((st, idx) => {
      // Create reasonable distribution of attendance
      if (idx === 7) return; // Inactive student
      const rand = (i * 7 + idx * 13) % 100;
      let status: 'present' | 'late' | 'absent' | 'leave' = 'present';
      let isLate = false;
      let isGeofenceAlert = false;

      if (rand < 75) {
        status = 'present';
      } else if (rand < 88) {
        status = 'late';
        isLate = true;
      } else if (rand < 94) {
        status = 'leave';
      } else {
        status = 'absent';
      }

      if (status !== 'absent' && status !== 'leave') {
        const startHour = isLate ? 8 : 7;
        const startMin = isLate ? 35 : 45;
        const duration = 450 + (rand % 60);

        records.push({
          id: `att-hist-${i}-${st.studentId}`,
          studentId: st.studentId,
          studentName: st.fullName,
          department: st.department,
          program: st.program,
          date: dStr,
          signInTime: `${dStr}T0${startHour}:${startMin}:00Z`,
          signInLatitude: 24.7136,
          signInLongitude: 46.6753,
          signInLocationName: 'Main Training Hospital',
          signOutTime: `${dStr}T16:15:00Z`,
          signOutLatitude: 24.7137,
          signOutLongitude: 46.6754,
          signOutLocationName: 'Main Training Hospital',
          durationMinutes: duration,
          status,
          isLate,
          isOutsideGeofence: isGeofenceAlert,
          deviceInfo: 'Standard Institutional Station / Mobile Web',
          createdAt: `${dStr}T0${startHour}:${startMin}:00Z`,
        });
      }
    });
  }

  return records;
}

// Initial Leave Requests
const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    studentId: 'STU-2024-001',
    studentName: 'Omar Farooq',
    studentEmail: 'omar.farooq@student.edu',
    department: 'Medicine & Surgery',
    leaveType: 'educational',
    startDate: getDateString(3),
    endDate: getDateString(5),
    totalDays: 3,
    reason: 'Presenting research paper on Cardiology AI Simulation at the National Healthcare Symposium.',
    educationalActivity: 'Annual Healthcare Innovation Summit & Workshop',
    attachmentName: 'symposium_invitation_letter.pdf',
    attachmentSize: '1.2 MB',
    status: 'pending',
    createdAt: `${getDateString(-1)}T14:20:00Z`,
  },
  {
    id: 'leave-2',
    studentId: 'STU-2024-002',
    studentName: 'Fatima Zahra',
    studentEmail: 'fatima.zahra@student.edu',
    department: 'Clinical Pharmacy',
    leaveType: 'sick',
    startDate: getDateString(1),
    endDate: getDateString(2),
    totalDays: 2,
    reason: 'Undergoing dental surgery and recovery period as recommended by attending oral surgeon.',
    attachmentName: 'clinical_medical_certificate.pdf',
    attachmentSize: '840 KB',
    status: 'pending',
    createdAt: `${getDateString(0)}T06:40:00Z`,
  },
  {
    id: 'leave-3',
    studentId: 'STU-2024-003',
    studentName: 'Zaid Malik',
    studentEmail: 'zaid.malik@student.edu',
    department: 'Nursing & Critical Care',
    leaveType: 'annual',
    startDate: getDateString(-5),
    endDate: getDateString(-3),
    totalDays: 3,
    reason: 'Family event and scheduled personal leave during academic rotation recess.',
    status: 'approved',
    adminComment: 'Approved. Student has completed all mandatory shifts in ICU ward.',
    reviewedBy: 'Dr. Sarah Al-Mansoor',
    reviewedAt: `${getDateString(-6)}T11:00:00Z`,
    createdAt: `${getDateString(-7)}T09:15:00Z`,
  },
  {
    id: 'leave-4',
    studentId: 'STU-2024-004',
    studentName: 'Mariam Al-Harbi',
    studentEmail: 'mariam.harbi@student.edu',
    department: 'Medicine & Surgery',
    leaveType: 'urgent',
    startDate: getDateString(7),
    endDate: getDateString(7),
    totalDays: 1,
    reason: 'Urgent family medical situation requiring travel.',
    emergencyDescription: 'Escorting parent for specialist hospital admission.',
    status: 'pending',
    createdAt: `${getDateString(0)}T09:00:00Z`,
  },
  {
    id: 'leave-5',
    studentId: 'STU-2024-005',
    studentName: 'Abdullah Al-Shehri',
    studentEmail: 'abdullah.shehri@student.edu',
    department: 'Health Informatics',
    leaveType: 'educational',
    startDate: getDateString(-12),
    endDate: getDateString(-10),
    totalDays: 3,
    reason: 'Attending Data Science in Healthcare Bootcamp.',
    status: 'approved',
    adminComment: 'Accredited professional training activity.',
    reviewedBy: 'Prof. Khalid Al-Otaibi',
    reviewedAt: `${getDateString(-13)}T15:30:00Z`,
    createdAt: `${getDateString(-14)}T10:00:00Z`,
  },
  {
    id: 'leave-6',
    studentId: 'STU-2024-007',
    studentName: 'Hassan Al-Amoudi',
    studentEmail: 'hassan.amoudi@student.edu',
    department: 'Radiology & Medical Imaging',
    leaveType: 'annual',
    startDate: getDateString(-20),
    endDate: getDateString(-18),
    totalDays: 3,
    reason: 'Personal leave during mid-semester break.',
    status: 'rejected',
    adminComment: 'Conflict with mandatory clinical simulation examination schedule.',
    reviewedBy: 'Dr. Sarah Al-Mansoor',
    reviewedAt: `${getDateString(-21)}T13:00:00Z`,
    createdAt: `${getDateString(-22)}T11:00:00Z`,
  },
];

// Initial Notifications
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'all_admins',
    title: 'New Leave Request Submitted',
    message: 'Omar Farooq submitted an Educational Leave request for 3 days.',
    notificationType: 'leave_submitted',
    isRead: false,
    referenceId: 'leave-1',
    createdAt: `${getDateString(-1)}T14:20:00Z`,
  },
  {
    id: 'notif-2',
    userId: 'all_admins',
    title: 'Geofence Exception Flagged',
    message: 'Mariam Al-Harbi signed in 580m outside Main Training Hospital boundary.',
    notificationType: 'geofence_alert',
    isRead: false,
    referenceId: 'att-today-4',
    createdAt: `${getDateString(0)}T08:05:00Z`,
  },
  {
    id: 'notif-3',
    userId: 'STU-2024-003',
    title: 'Leave Request Approved',
    message: 'Your Annual Leave request for 3 days has been approved by Dr. Sarah Al-Mansoor.',
    notificationType: 'leave_status',
    isRead: true,
    referenceId: 'leave-3',
    createdAt: `${getDateString(-6)}T11:00:00Z`,
  },
  {
    id: 'notif-4',
    userId: 'STU-2024-001',
    title: 'Welcome to the Attendance Portal',
    message: 'Please ensure location permissions are granted when checking in for clinical shifts.',
    notificationType: 'system',
    isRead: false,
    createdAt: `${getDateString(-10)}T08:00:00Z`,
  }
];

// Initial Audit Logs
const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    action: 'LEAVE_APPROVAL',
    performedBy: 'Dr. Sarah Al-Mansoor',
    performerRole: 'admin',
    targetType: 'leave',
    targetId: 'leave-3',
    details: 'Approved 3 days annual leave for Zaid Malik (STU-2024-003). Comment: Approved. Student has completed all mandatory shifts in ICU ward.',
    timestamp: `${getDateString(-6)}T11:00:00Z`,
  },
  {
    id: 'audit-2',
    action: 'STUDENT_ACCOUNT_CREATED',
    performedBy: 'Dr. Sarah Al-Mansoor',
    performerRole: 'admin',
    targetType: 'student',
    targetId: 'STU-2024-008',
    details: 'Enrolled new student Layla Al-Khatib into Nursing & Critical Care program.',
    timestamp: `${getDateString(-15)}T10:00:00Z`,
  },
  {
    id: 'audit-3',
    action: 'LOCATION_RADIUS_MODIFIED',
    performedBy: 'Prof. Khalid Al-Otaibi',
    performerRole: 'admin',
    targetType: 'location',
    targetId: 'loc-1',
    details: 'Updated allowed radius for Main Training Hospital to 150 meters.',
    timestamp: `${getDateString(-20)}T09:30:00Z`,
  },
  {
    id: 'audit-4',
    action: 'BULK_IMPORT',
    performedBy: 'Dr. Sarah Al-Mansoor',
    performerRole: 'admin',
    targetType: 'bulk_import',
    targetId: 'batch-2026-spring',
    details: 'Successfully imported 7 students from Spring 2026 Cohort Excel sheet.',
    timestamp: `${getDateString(-25)}T14:10:00Z`,
  }
];

// Storage Engine
class AppStorage {
  // Initialization
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateDefaultAttendance()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(DEFAULT_LEAVES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Dr. Sarah (Admin) for initial view
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LANGUAGE)) {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'en');
    }
  }

  public resetAllData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateDefaultAttendance()));
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(DEFAULT_LEAVES));
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
  }

  // Language
  public getLanguage(): 'en' | 'ar' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'en' | 'ar') || 'en';
  }

  public setLanguage(lang: 'en' | 'ar') {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  // Users & Auth
  public getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEFAULT_USERS;
  }

  public saveUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.unshift(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  public getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : DEFAULT_USERS[0];
  }

  public setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // Students
  public getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : DEFAULT_STUDENTS;
  }

  public getStudentById(studentId: string): Student | undefined {
    return this.getStudents().find(s => s.studentId === studentId);
  }

  public saveStudent(student: Student, actorName: string = 'Admin'): boolean {
    const students = this.getStudents();
    const existingIndex = students.findIndex(s => s.studentId === student.studentId || s.id === student.id);
    const isNew = existingIndex < 0;

    if (isNew) {
      // Check for duplicate ID
      if (students.some(s => s.studentId === student.studentId)) {
        return false;
      }
      student.id = student.id || `stu-${Date.now()}`;
      student.createdAt = student.createdAt || new Date().toISOString();
      student.leaveBalance = student.leaveBalance || {
        annualTotal: 21,
        annualUsed: 0,
        sickTotal: 14,
        sickUsed: 0,
        educationalTotal: 7,
        educationalUsed: 0,
      };
      students.unshift(student);

      // Create linked student login user
      const users = this.getUsers();
      if (!users.some(u => u.studentId === student.studentId)) {
        users.push({
          id: `user-${student.studentId}`,
          username: student.email.split('@')[0],
          role: 'student',
          status: 'active',
          fullName: student.fullName,
          email: student.email,
          studentId: student.studentId,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }

      this.addAuditLog({
        action: 'STUDENT_ACCOUNT_CREATED',
        performedBy: actorName,
        performerRole: 'admin',
        targetType: 'student',
        targetId: student.studentId,
        details: `Created account for ${student.fullName} (${student.studentId}) in ${student.department}.`,
      });
    } else {
      students[existingIndex] = { ...students[existingIndex], ...student };
      this.addAuditLog({
        action: 'STUDENT_ACCOUNT_MODIFIED',
        performedBy: actorName,
        performerRole: 'admin',
        targetType: 'student',
        targetId: student.studentId,
        details: `Updated details for ${student.fullName} (${student.studentId}).`,
      });
    }

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return true;
  }

  public deactivateStudent(studentId: string, actorName: string = 'Admin') {
    const students = this.getStudents();
    const student = students.find(s => s.studentId === studentId);
    if (student) {
      student.status = student.status === 'active' ? 'inactive' : 'active';
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      this.addAuditLog({
        action: student.status === 'active' ? 'STUDENT_ACTIVATED' : 'STUDENT_DEACTIVATED',
        performedBy: actorName,
        performerRole: 'admin',
        targetType: 'student',
        targetId: studentId,
        details: `Toggled status to ${student.status} for ${student.fullName} (${studentId}).`,
      });
    }
  }

  public deleteStudent(studentId: string, actorName: string = 'Admin') {
    const students = this.getStudents().filter(s => s.studentId !== studentId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.addAuditLog({
      action: 'STUDENT_DELETED',
      performedBy: actorName,
      performerRole: 'admin',
      targetType: 'student',
      targetId: studentId,
      details: `Permanently removed student record ${studentId}.`,
    });
  }

  // Attendance
  public getAttendanceRecords(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  }

  public getActiveSession(studentId: string): AttendanceRecord | undefined {
    const today = getDateString(0);
    const records = this.getAttendanceRecords();
    return records.find(r => r.studentId === studentId && r.date === today && !r.signOutTime);
  }

  public recordSignIn(params: {
    studentId: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    isOutsideGeofence?: boolean;
    deviceInfo?: string;
  }): { success: boolean; record?: AttendanceRecord; error?: string } {
    const student = this.getStudentById(params.studentId);
    if (!student) {
      return { success: false, error: 'Student record not found.' };
    }

    // Rule 1: A student cannot have two active sign-in sessions
    const active = this.getActiveSession(params.studentId);
    if (active) {
      return { success: false, error: 'Student already has an active sign-in session. Must sign out first.' };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Standard expected arrival time is before 08:30
    const isLate = (hour === 8 && minute > 30) || hour > 8;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      studentId: params.studentId,
      studentName: student.fullName,
      department: student.department,
      program: student.program,
      date: today,
      signInTime: now.toISOString(),
      signInLatitude: params.latitude,
      signInLongitude: params.longitude,
      signInLocationName: params.locationName || 'Main Training Facility',
      signOutTime: null,
      durationMinutes: null,
      status: isLate ? 'late' : 'present',
      isLate,
      isOutsideGeofence: !!params.isOutsideGeofence,
      deviceInfo: params.deviceInfo || navigator.userAgent,
      createdAt: now.toISOString(),
    };

    const records = this.getAttendanceRecords();
    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

    // If signed in outside geofence, send notification to admin
    if (params.isOutsideGeofence) {
      this.addNotification({
        userId: 'all_admins',
        title: 'Geofence Exception Flagged',
        message: `${student.fullName} (${student.studentId}) signed in outside approved location perimeter.`,
        notificationType: 'geofence_alert',
        referenceId: newRecord.id,
      });

      this.addAuditLog({
        action: 'ATTENDANCE_GEOFENCE_EXCEPTION',
        performedBy: student.fullName,
        performerRole: 'student',
        targetType: 'attendance',
        targetId: newRecord.id,
        details: `Student signed in outside approved boundary at ${params.locationName || 'Unknown'}.`,
      });
    }

    return { success: true, record: newRecord };
  }

  public recordSignOut(params: {
    studentId: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
  }): { success: boolean; record?: AttendanceRecord; error?: string } {
    const active = this.getActiveSession(params.studentId);
    if (!active) {
      return { success: false, error: 'No active sign-in session found to sign out from.' };
    }

    const now = new Date();
    const signInTime = new Date(active.signInTime);
    const durationMinutes = Math.max(1, Math.round((now.getTime() - signInTime.getTime()) / 60000));

    active.signOutTime = now.toISOString();
    active.signOutLatitude = params.latitude;
    active.signOutLongitude = params.longitude;
    active.signOutLocationName = params.locationName || 'Main Training Facility';
    active.durationMinutes = durationMinutes;

    const records = this.getAttendanceRecords();
    const idx = records.findIndex(r => r.id === active.id);
    if (idx >= 0) {
      records[idx] = active;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    }

    return { success: true, record: active };
  }

  public modifyAttendanceRecordByAdmin(record: AttendanceRecord, adminName: string, reason: string) {
    const records = this.getAttendanceRecords();
    const idx = records.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      records[idx] = {
        ...record,
        modifiedByAdmin: true,
        adminNote: reason,
      };
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

      this.addAuditLog({
        action: 'ATTENDANCE_MODIFIED',
        performedBy: adminName,
        performerRole: 'admin',
        targetType: 'attendance',
        targetId: record.id,
        details: `Manually altered attendance for ${record.studentName} on ${record.date}. Reason: ${reason}`,
      });
    }
  }

  // Leave Requests
  public getLeaveRequests(): LeaveRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return raw ? JSON.parse(raw) : [];
  }

  public submitLeaveRequest(req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): { success: boolean; leave?: LeaveRequest; error?: string } {
    const existing = this.getLeaveRequests().filter(
      l => l.studentId === req.studentId && l.status !== 'rejected' && l.status !== 'cancelled'
    );

    // Rule 11: Leave requests cannot overlap unless explicitly permitted
    const reqStart = new Date(req.startDate).getTime();
    const reqEnd = new Date(req.endDate).getTime();

    const hasOverlap = existing.some(l => {
      const exStart = new Date(l.startDate).getTime();
      const exEnd = new Date(l.endDate).getTime();
      return reqStart <= exEnd && reqEnd >= exStart;
    });

    if (hasOverlap) {
      return { success: false, error: 'A leave request already exists covering this date range.' };
    }

    const newLeave: LeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const leaves = this.getLeaveRequests();
    leaves.unshift(newLeave);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));

    // Notify Admins
    this.addNotification({
      userId: 'all_admins',
      title: 'New Leave Request Submitted',
      message: `${req.studentName} requested ${req.totalDays} day(s) of ${req.leaveType} leave.`,
      notificationType: 'leave_submitted',
      referenceId: newLeave.id,
    });

    this.addAuditLog({
      action: 'LEAVE_SUBMITTED',
      performedBy: req.studentName,
      performerRole: 'student',
      targetType: 'leave',
      targetId: newLeave.id,
      details: `Submitted ${req.leaveType} leave from ${req.startDate} to ${req.endDate} (${req.totalDays} days).`,
    });

    return { success: true, leave: newLeave };
  }

  public reviewLeaveRequest(params: {
    leaveId: string;
    decision: 'approved' | 'rejected' | 'info_requested';
    adminComment: string;
    adminName: string;
  }) {
    const leaves = this.getLeaveRequests();
    const leave = leaves.find(l => l.id === params.leaveId);
    if (!leave) return false;

    leave.status = params.decision;
    leave.adminComment = params.adminComment;
    leave.reviewedBy = params.adminName;
    leave.reviewedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));

    // If approved, update student leave balance & attendance calendar
    if (params.decision === 'approved') {
      const students = this.getStudents();
      const student = students.find(s => s.studentId === leave.studentId);
      if (student && student.leaveBalance) {
        if (leave.leaveType === 'annual') student.leaveBalance.annualUsed += leave.totalDays;
        if (leave.leaveType === 'sick') student.leaveBalance.sickUsed += leave.totalDays;
        if (leave.leaveType === 'educational') student.leaveBalance.educationalUsed += leave.totalDays;
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      }
    }

    // Notify the student
    const decisionText =
      params.decision === 'approved' ? 'Approved' :
      params.decision === 'rejected' ? 'Rejected' : 'Additional Information Requested';

    this.addNotification({
      userId: leave.studentId,
      title: `Leave Request ${decisionText}`,
      message: `Your ${leave.leaveType} leave request has been ${decisionText.toLowerCase()} by ${params.adminName}. ${params.adminComment ? `Note: ${params.adminComment}` : ''}`,
      notificationType: 'leave_status',
      referenceId: leave.id,
    });

    this.addAuditLog({
      action: `LEAVE_${params.decision.toUpperCase()}`,
      performedBy: params.adminName,
      performerRole: 'admin',
      targetType: 'leave',
      targetId: leave.id,
      details: `Status set to ${params.decision} for ${leave.studentName} (${leave.totalDays} days). Comment: ${params.adminComment}`,
    });

    return true;
  }

  // Locations (Geofencing)
  public getLocations(): LocationSite[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return raw ? JSON.parse(raw) : DEFAULT_LOCATIONS;
  }

  public saveLocation(loc: LocationSite, actorName: string = 'Admin') {
    const locations = this.getLocations();
    const idx = locations.findIndex(l => l.id === loc.id);
    if (idx >= 0) {
      locations[idx] = loc;
    } else {
      loc.id = loc.id || `loc-${Date.now()}`;
      locations.push(loc);
    }
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));

    this.addAuditLog({
      action: 'LOCATION_CONFIG_UPDATED',
      performedBy: actorName,
      performerRole: 'admin',
      targetType: 'location',
      targetId: loc.id,
      details: `Saved location '${loc.locationName}' with radius ${loc.allowedRadiusMeters}m.`,
    });
  }

  public deleteLocation(id: string, actorName: string = 'Admin') {
    const locations = this.getLocations().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    this.addAuditLog({
      action: 'LOCATION_DELETED',
      performedBy: actorName,
      performerRole: 'admin',
      targetType: 'location',
      targetId: id,
      details: `Deleted location ID ${id}.`,
    });
  }

  // Notifications
  public getNotifications(userId?: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: AppNotification[] = raw ? JSON.parse(raw) : [];
    if (!userId) return all;
    return all.filter(n => n.userId === userId || n.userId === 'all_admins');
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) {
    const notifications = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  public markNotificationAsRead(id: string) {
    const notifications = this.getNotifications();
    const target = notifications.find(n => n.id === id);
    if (target) {
      target.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  }

  public markAllNotificationsAsRead(userId?: string) {
    const notifications = this.getNotifications();
    notifications.forEach(n => {
      if (!userId || n.userId === userId || n.userId === 'all_admins') {
        n.isRead = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }
}

export const storage = new AppStorage();
