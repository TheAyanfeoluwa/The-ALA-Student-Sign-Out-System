import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, User, StudentRequirement, ClearanceStatus, StudentItemRegistration, AdminUnlockRequest } from '../types';
import { mockStudents, mockUsers, mockStudentRequirements } from '../data/mockData';

interface DataContextType {
  students: Student[];
  users: User[];
  studentRequirements: StudentRequirement[];
  studentItemRegistrations: StudentItemRegistration[];
  unlockRequests: AdminUnlockRequest[];
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  addStudent: (student: Student) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  lockUser: (userId: string, reason: string, attemptCount: number) => void;
  unlockUser: (userId: string) => void;
  addUnlockRequest: (request: AdminUnlockRequest) => void;
  updateUnlockRequest: (requestId: string, updates: Partial<AdminUnlockRequest>) => void;
  addStudentRequirement: (requirement: StudentRequirement) => void;
  updateStudentRequirement: (requirementId: string, updates: Partial<StudentRequirement>) => void;
  addStudentItemRegistration: (registration: StudentItemRegistration) => void;
  updateStudentItemRegistration: (registrationId: string, updates: Partial<StudentItemRegistration>) => void;
  approveStudent: (studentId: string, role: string, approverName: string) => void;
  submitClearanceItem: (studentId: string, itemId: string, status: ClearanceStatus, completedBy?: string, notes?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [studentRequirements, setStudentRequirements] = useState<StudentRequirement[]>(mockStudentRequirements);
  const [studentItemRegistrations, setStudentItemRegistrations] = useState<StudentItemRegistration[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<AdminUnlockRequest[]>([]);

  // Sync students with users when students are updated
  useEffect(() => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.role === 'student') {
          const updatedStudent = students.find(s => s.id === user.studentInfo?.id);
          if (updatedStudent) {
            return { ...user, studentInfo: updatedStudent };
          }
        }
        return user;
      })
    );
  }, [students]);

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, ...updates } : student
    ));
  };

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const addStudentRequirement = (requirement: StudentRequirement) => {
    setStudentRequirements(prev => [...prev, requirement]);
  };

  const updateStudentRequirement = (requirementId: string, updates: Partial<StudentRequirement>) => {
    setStudentRequirements(prev => prev.map(req => 
      req.id === requirementId ? { ...req, ...updates } : req
    ));
  };

  const addStudentItemRegistration = (registration: StudentItemRegistration) => {
    setStudentItemRegistrations(prev => [...prev, registration]);
  };

  const updateStudentItemRegistration = (registrationId: string, updates: Partial<StudentItemRegistration>) => {
    setStudentItemRegistrations(prev => prev.map(reg => 
      reg.id === registrationId ? { ...reg, ...updates } : reg
    ));
  };

  const lockUser = (userId: string, reason: string, attemptCount: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? {
        ...user,
        isLocked: true,
        lockReason: reason,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        loginAttempts: attemptCount,
        lastLoginAttempt: new Date().toISOString()
      } : user
    ));
  };

  const unlockUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? {
        ...user,
        isLocked: false,
        lockReason: undefined,
        lockedUntil: undefined,
        loginAttempts: 0
      } : user
    ));
  };

  const addUnlockRequest = (request: AdminUnlockRequest) => {
    setUnlockRequests(prev => [...prev, request]);
  };

  const updateUnlockRequest = (requestId: string, updates: Partial<AdminUnlockRequest>) => {
    setUnlockRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, ...updates } : req
    ));
  };

  const approveStudent = (studentId: string, role: string, approverName: string) => {
    const timestamp = new Date().toISOString();
    
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const newApprovalStatus = { ...student.approvalStatus };
        
        switch (role) {
          case 'station_staff':
            newApprovalStatus.stationStaffApproval = true;
            newApprovalStatus.stationStaffApprovedBy = approverName;
            newApprovalStatus.stationStaffApprovedAt = timestamp;
            break;
          case 'teacher':
            newApprovalStatus.teacherApproval = true;
            newApprovalStatus.teacherApprovedBy = approverName;
            newApprovalStatus.teacherApprovedAt = timestamp;
            break;
          case 'hall_head':
            newApprovalStatus.hallHeadApproval = true;
            newApprovalStatus.hallHeadApprovedBy = approverName;
            newApprovalStatus.hallHeadApprovedAt = timestamp;
            break;
          case 'advisor':
            newApprovalStatus.advisorApproval = true;
            newApprovalStatus.advisorApprovedBy = approverName;
            newApprovalStatus.advisorApprovedAt = timestamp;
            break;
          case 'year_head':
            newApprovalStatus.yearHeadApproval = true;
            newApprovalStatus.yearHeadApprovedBy = approverName;
            newApprovalStatus.yearHeadApprovedAt = timestamp;
            break;
        }

        // Check if all approvals are complete for final clearance
        const allApproved = newApprovalStatus.stationStaffApproval && 
                           newApprovalStatus.teacherApproval && 
                           newApprovalStatus.hallHeadApproval && 
                           newApprovalStatus.advisorApproval;

        let finalStatus = student.finalClearanceStatus;
        let confirmationCode = student.confirmationCode;
        let finalApprovedBy = student.finalApprovedBy;
        let finalApprovedAt = student.finalApprovedAt;

        if (allApproved && finalStatus !== 'completed') {
          finalStatus = 'completed';
          confirmationCode = `CLR2024${Date.now().toString().slice(-3)}`;
          finalApprovedBy = 'System';
          finalApprovedAt = timestamp;
        }

        return {
          ...student,
          approvalStatus: newApprovalStatus,
          finalClearanceStatus: finalStatus,
          confirmationCode,
          finalApprovedBy,
          finalApprovedAt
        };
      }
      return student;
    }));
  };

  const submitClearanceItem = (studentId: string, itemId: string, status: ClearanceStatus, completedBy?: string, notes?: string) => {
    const timestamp = new Date().toISOString();
    
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedItems = student.clearanceItems.map(item => {
          if (item.itemId === itemId) {
            return {
              ...item,
              status,
              completedBy,
              completedAt: status === 'completed' ? timestamp : undefined,
              notes
            };
          }
          return item;
        });

        return { ...student, clearanceItems: updatedItems };
      }
      return student;
    }));
  };

  const value: DataContextType = {
    students,
    users,
    studentRequirements,
    studentItemRegistrations,
    unlockRequests,
    updateStudent,
    addStudent,
    addUser,
    updateUser,
    lockUser,
    unlockUser,
    addUnlockRequest,
    updateUnlockRequest,
    addStudentRequirement,
    updateStudentRequirement,
    addStudentItemRegistration,
    updateStudentItemRegistration,
    approveStudent,
    submitClearanceItem
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataStore must be used within a DataProvider');
  }
  return context;
}