import { Student, ClearanceItem, ClearanceStatus, SubmissionStation, ItemSubmission, User, ClassInfo, SystemStats, StudentRequirement, SignOutRequest } from '../types';

export const mockClearanceItems: ClearanceItem[] = [
  // Subject-by-subject items
  {
    id: '1',
    name: 'Calculator',
    category: 'subject_materials',
    description: 'Scientific calculator issued for mathematics',
    isRequired: true,
    requiresSubmission: true
  },
  {
    id: '2',
    name: 'Mathematics Textbook',
    category: 'subject_materials',
    description: 'Mathematics course textbook',
    isRequired: true,
    requiresSubmission: true
  },
  {
    id: '3',
    name: 'Computer Science Textbook',
    category: 'subject_materials',
    description: 'Computer Science course textbook',
    isRequired: true,
    requiresSubmission: true
  },
  {
    id: '4',
    name: 'Physics Textbook',
    category: 'subject_materials',
    description: 'Physics course textbook',
    isRequired: true,
    requiresSubmission: true
  },
  // Other requirements
  {
    id: '5',
    name: 'Uniform',
    category: 'other_requirements',
    description: 'School uniform items',
    isRequired: true,
    requiresSubmission: true
  },
  {
    id: '6',
    name: 'Sports Equipment',
    category: 'other_requirements',
    description: 'Any borrowed sports equipment',
    isRequired: true,
    requiresSubmission: true
  },
  {
    id: '7',
    name: 'Finance Clearance',
    category: 'finance',
    description: 'Outstanding tuition and fees',
    isRequired: true,
    requiresSubmission: false
  }
];

export const mockSubmissionStations: SubmissionStation[] = [
  {
    id: 'station1',
    name: 'Academic Items Collection',
    location: 'Library Counter',
    staffInCharge: 'Ms. Johnson',
    acceptedItems: ['1', '2', '3', '4'] // Calculator, Math Textbook, CS Textbook, Physics Textbook
  },
  {
    id: 'station2',
    name: 'Property Return Station',
    location: 'Reception',
    staffInCharge: 'Mr. Davis',
    acceptedItems: ['5', '6'] // Uniform, Sports Equipment
  }
];

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Ayanfe Ayanlade',
    studentId: 'ALA2024-101',
    grade: 'Year 2',
    section: '',
    email: 'aayanlade24@alastudents.org',
    hall: 'West Wing',
    room: '204',
    advisor: 'Ms. Catherine Delight',
    teacher: 'Ismail Adeleke',
    yearHead: 'Ms. Sebabatso',
    outstandingBalance: 150.00,
    clearanceItems: [
      {
        itemId: '1',
        studentId: '1',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-15T10:30:00Z',
        notes: 'Calculator returned in good condition'
      },
      {
        itemId: '2',
        studentId: '1',
        status: 'pending'
      },
      {
        itemId: '3',
        studentId: '1',
        status: 'pending'
      },
      {
        itemId: '4',
        studentId: '1',
        status: 'pending'
      },
      {
        itemId: '5',
        studentId: '1',
        status: 'pending'
      },
      {
        itemId: '6',
        studentId: '1',
        status: 'pending'
      },
      {
        itemId: '7',
        studentId: '1',
        status: 'action_required',
        outstandingAmount: 150.00
      }
    ],
    approvalStatus: {
      studentId: '1',
      stationStaffApproval: false,
      teacherApproval: false,
      hallHeadApproval: false,
      advisorApproval: false
    },
    finalClearanceStatus: 'pending'
  },
  {
    id: '2',
    name: 'Yabets Abebe',
    studentId: 'ALA2024-102',
    grade: 'Year 1',
    section: '',
    email: 'yabebe24@alastudents.org',
    hall: 'West Wing',
    room: '156',
    advisor: 'Ms. Catherine Delight',
    teacher: 'Ismail Adeleke',
    yearHead: 'Ms. Sebabatso',
    outstandingBalance: 0,
    clearanceItems: [
      {
        itemId: '1',
        studentId: '2',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-14T09:30:00Z'
      },
      {
        itemId: '2',
        studentId: '2',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-14T09:30:00Z'
      },
      {
        itemId: '3',
        studentId: '2',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-14T09:30:00Z'
      },
      {
        itemId: '4',
        studentId: '2',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-14T09:30:00Z'
      },
      {
        itemId: '5',
        studentId: '2',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-14T09:30:00Z'
      },
      {
        itemId: '6',
        studentId: '2',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-14T09:30:00Z'
      },
      {
        itemId: '7',
        studentId: '2',
        status: 'completed',
        completedBy: 'Finance Office',
        completedAt: '2024-01-10T09:00:00Z'
      }
    ],
    approvalStatus: {
      studentId: '2',
      stationStaffApproval: true,
      stationStaffApprovedBy: 'Reception Staff',
      stationStaffApprovedAt: '2024-01-14T10:00:00Z',
      teacherApproval: false,
      hallHeadApproval: false,
      advisorApproval: false
    },
    finalClearanceStatus: 'pending'
  },
  {
    id: '3',
    name: 'Hassiet Fisseha',
    studentId: 'ALA2024-103',
    grade: 'Year 2',
    section: '',
    email: 'hfisseha24@alastudents.org',
    hall: 'East Wing',
    room: '201',
    advisor: 'Ms. Catherine Delight',
    teacher: 'Ismail Adeleke',
    yearHead: 'Ms. Sebabatso',
    outstandingBalance: 0,
    clearanceItems: [
      {
        itemId: '1',
        studentId: '3',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-16T11:00:00Z'
      },
      {
        itemId: '2',
        studentId: '3',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-16T11:00:00Z'
      },
      {
        itemId: '3',
        studentId: '3',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-16T11:00:00Z'
      },
      {
        itemId: '4',
        studentId: '3',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-16T11:00:00Z'
      },
      {
        itemId: '5',
        studentId: '3',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-16T11:00:00Z'
      },
      {
        itemId: '6',
        studentId: '3',
        status: 'completed',
        completedBy: 'Reception Staff',
        completedAt: '2024-01-16T11:00:00Z'
      },
      {
        itemId: '7',
        studentId: '3',
        status: 'completed',
        completedBy: 'Finance Office',
        completedAt: '2024-01-15T08:00:00Z'
      }
    ],
    approvalStatus: {
      studentId: '3',
      stationStaffApproval: true,
      stationStaffApprovedBy: 'Reception Staff',
      stationStaffApprovedAt: '2024-01-16T12:00:00Z',
      teacherApproval: true,
      teacherApprovedBy: 'Ismail Adeleke',
      teacherApprovedAt: '2024-01-16T14:00:00Z',
      hallHeadApproval: true,
      hallHeadApprovedBy: 'Dr. Brown',
      hallHeadApprovedAt: '2024-01-16T15:30:00Z',
      advisorApproval: true,
      advisorApprovedBy: 'Ms. Catherine Delight',
      advisorApprovedAt: '2024-01-16T16:00:00Z',
      yearHeadApproval: true,
      yearHeadApprovedBy: 'Ms. Sebabatso',
      yearHeadApprovedAt: '2024-01-16T17:00:00Z'
    },
    finalClearanceStatus: 'completed',
    confirmationCode: 'CLR2024003',
    finalApprovedBy: 'System',
    finalApprovedAt: '2024-01-16T16:05:00Z'
  }
];

export const mockClasses: ClassInfo[] = [
  {
    id: 'class1',
    name: 'Mathematics Year 2',
    grade: 'Year 2',
    section: '',
    teacher: 'Ismail Adeleke',
    students: [mockStudents[0], mockStudents[2]]
  },
  {
    id: 'class2',
    name: 'English Year 1',
    grade: 'Year 1',
    section: '',
    teacher: 'Ismail Adeleke',
    students: [mockStudents[1]]
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ayanfe Ayanlade',
    email: 'aayanlade24@alastudents.org',
    role: 'student',
    studentInfo: mockStudents[0]
  },
  {
    id: '2',
    name: 'Yabets Abebe',
    email: 'yabebe24@alastudents.org',
    role: 'student',
    studentInfo: mockStudents[1]
  },
  {
    id: '3',
    name: 'Hassiet Fisseha',
    email: 'hfisseha24@alastudents.org',
    role: 'student',
    studentInfo: mockStudents[2]
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@africanleadershipacademy.org',
    role: 'admin'
  },
  {
    id: '5',
    name: 'Ismail Adeleke',
    email: 'IAdeleke@africanleadershipacademy.org',
    role: 'teacher',
    teacherClasses: ['class1']
  },
  {
    id: '6',
    name: 'Reception Staff',
    email: 'reception@africanleadershipacademy.org',
    role: 'station_staff'
  },
  {
    id: '7',
    name: 'Dr. Brown',
    email: 'brown@africanleadershipacademy.org',
    role: 'hall_head',
    managedHalls: ['East Wing', 'West Wing']
  },
  {
    id: '8',
    name: 'Ms. Catherine Delight',
    email: 'CDelight@africanleadershipacademy.org',
    role: 'advisor',
    advisees: ['1', '2', '3'] // All students
  },
  {
    id: '9',
    name: 'Ms. Sebabatso',
    email: 'SThulo@africanleadershipacademy.org',
    role: 'year_head'
  }
];

export const mockSystemStats: SystemStats = {
  totalStudents: 150,
  clearedStudents: 45,
  pendingStudents: 105,
  itemsNeedingAttention: 23,
  financeOutstanding: 15420.00,
  newTextbooksNeeded: 12
};

export const mockStudentRequirements: StudentRequirement[] = [
  {
    id: '1',
    studentId: '1',
    teacherId: '5',
    teacherName: 'Ismail Adeleke',
    requirement: 'Complete final mathematics project submission',
    dueDate: '2024-01-25',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-01-15T09:00:00Z',
    notes: 'Project must include all calculations and diagrams'
  },
  {
    id: '2',
    studentId: '2',
    teacherId: '5',
    teacherName: 'Ismail Adeleke',
    requirement: 'Submit missing assignment from Chapter 5',
    dueDate: '2024-01-22',
    priority: 'medium',
    status: 'pending',
    createdAt: '2024-01-14T14:30:00Z'
  }
];

export const mockSignOutRequests: SignOutRequest[] = [
  {
    id: '1',
    student: {
      name: 'Ayanfe Ayanlade',
      studentId: 'ALA2024-101',
      grade: 'Year 2',
      section: ''
    },
    reason: 'Medical appointment in Johannesburg',
    requestDate: '2024-01-16T09:00:00Z',
    status: 'pending'
  },
  {
    id: '2',
    student: {
      name: 'Yabets Abebe',
      studentId: 'ALA2024-102',
      grade: 'Year 1',
      section: ''
    },
    reason: 'Family emergency - immediate departure required',
    requestDate: '2024-01-15T15:30:00Z',
    status: 'approved',
    reviewedBy: 'Admin User',
    reviewedAt: '2024-01-15T16:00:00Z',
    reviewNotes: 'Emergency approved, expedited clearance process'
  },
  {
    id: '3',
    student: {
      name: 'Hassiet Fisseha',
      studentId: 'ALA2024-103',
      grade: 'Year 2',
      section: ''
    },
    reason: 'University interview in Cape Town',
    requestDate: '2024-01-14T10:00:00Z',
    status: 'completed',
    reviewedBy: 'Admin User',
    reviewedAt: '2024-01-14T11:00:00Z',
    reviewNotes: 'All clearance requirements met'
  }
];