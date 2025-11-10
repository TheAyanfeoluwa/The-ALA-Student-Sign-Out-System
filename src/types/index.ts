

export interface ClearanceItem {
  id: string;
  name: string;
  category: 'subject_materials' | 'other_requirements' | 'finance' | 'administrative';
  description: string;
  isRequired: boolean;
  requiresSubmission: boolean; // true for physical items like textbooks
}

export interface ClearanceStatus {
  itemId: string;
  studentId: string;
  status: 'pending' | 'completed' | 'action_required';
  completedBy?: string;
  completedAt?: string;
  notes?: string;
  outstandingAmount?: number; // for finance items
}

export interface ApprovalStatus {
  studentId: string;
  stationStaffApproval: boolean;
  stationStaffApprovedBy?: string;
  stationStaffApprovedAt?: string;
  teacherApproval: boolean;
  teacherApprovedBy?: string;
  teacherApprovedAt?: string;
  hallHeadApproval: boolean;
  hallHeadApprovedBy?: string;
  hallHeadApprovedAt?: string;
  advisorApproval: boolean;
  advisorApprovedBy?: string;
  advisorApprovedAt?: string;
  yearHeadApproval?: boolean;
  yearHeadApprovedBy?: string;
  yearHeadApprovedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  section: string;
  email: string;
  hall?: string;
  advisor?: string;
  yearHead?: string;
  teacher?: string;
  room?: string;
  outstandingBalance?: number;
  clearanceItems: ClearanceStatus[];
  approvalStatus: ApprovalStatus;
  finalClearanceStatus: 'pending' | 'completed';
  confirmationCode?: string;
  finalApprovedBy?: string;
  finalApprovedAt?: string;
}

export interface SubmissionStation {
  id: string;
  name: string;
  location: string;
  staffInCharge: string;
  acceptedItems: string[]; // Array of clearance item IDs
}

export interface ItemSubmission {
  id: string;
  studentId: string;
  itemId: string;
  stationId: string;
  submittedAt: string;
  receivedBy: string;
  verified: boolean;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin' | 'teacher' | 'hall_head' | 'station_staff' | 'advisor' | 'year_head';
  studentInfo?: Student;
  teacherClasses?: string[]; // Array of class IDs for teachers
  managedHalls?: string[]; // Array of hall IDs for hall heads
  advisees?: string[]; // Array of student IDs for advisors
  managedGrades?: string[]; // Array of grades for year heads
  loginAttempts?: number;
  lockedUntil?: string;
  isLocked?: boolean;
  lastLoginAttempt?: string;
  lockReason?: string;
}

export interface AdminUnlockRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  lockedAt: string;
  attemptCount: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacher: string;
  students: Student[];
}

export interface SystemStats {
  totalStudents: number;
  clearedStudents: number;
  pendingStudents: number;
  itemsNeedingAttention: number;
  financeOutstanding: number;
  newTextbooksNeeded: number;
}

export interface StudentRequirement {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  requirement: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface SignOutRequest {
  id: string;
  student: {
    name: string;
    studentId: string;
    grade: string;
    section: string;
  };
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface StudentItemRegistration {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject?: string;
  serialNumber: string;
  itemType: 'calculator' | 'textbook' | 'it_equipment' | 'sports_equipment';
  itemDescription: string;
  registeredAt: string;
  registeredBy: string;
  status: 'assigned' | 'returned' | 'missing' | 'damaged';
  returnedAt?: string;
  condition?: 'good' | 'fair' | 'damaged';
  reportedIssue?: {
    type: 'missing' | 'damaged';
    reportedAt: string;
    description: string;
    resolved?: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
    resolutionNotes?: string;
  };
}