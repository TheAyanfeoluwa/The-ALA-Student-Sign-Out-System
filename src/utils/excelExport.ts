/**
 * Excel Export Utility with Multiple Sheets
 * Creates Excel files with multiple sheets for comprehensive data export
 */

import { Student, StudentItemRegistration } from '../types';

interface ExcelSheet {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Creates a CSV file from sheet data
 */
function createCSV(headers: string[], rows: (string | number)[][]): string {
  const escapeCsv = (value: string | number): string => {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const headerRow = headers.map(escapeCsv).join(',');
  const dataRows = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
  
  return `${headerRow}\n${dataRows}`;
}

/**
 * Downloads multiple CSV files as a ZIP (simulated by downloading sequentially)
 * In production, use a library like JSZip to create actual ZIP files
 */
function downloadMultipleCSVs(sheets: ExcelSheet[], baseFilename: string) {
  sheets.forEach((sheet, index) => {
    const csv = createCSV(sheet.headers, sheet.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}_${sheet.name}.csv`;
    
    // Stagger downloads to avoid browser blocking
    setTimeout(() => {
      link.click();
      URL.revokeObjectURL(url);
    }, index * 500);
  });
}

/**
 * Admin Export: All student data with multiple sheets
 */
export function exportAdminData(
  students: Student[],
  registrations: StudentItemRegistration[]
): void {
  const sheets: ExcelSheet[] = [];

  // Sheet 1: Student Overview with All Details
  sheets.push({
    name: '1_Student_Overview',
    headers: [
      'Student ID',
      'Name',
      'Email',
      'Grade',
      'Section',
      'Hall',
      'Room',
      'Advisor',
      'Year Head',
      'Teacher',
      'Final Clearance Status',
      'Confirmation Code',
      'Outstanding Balance',
      'Station Staff Approved',
      'Station Staff Approved By',
      'Station Staff Approved At',
      'Teacher Approved',
      'Teacher Approved By',
      'Teacher Approved At',
      'Hall Head Approved',
      'Hall Head Approved By',
      'Hall Head Approved At',
      'Advisor Approved',
      'Advisor Approved By',
      'Advisor Approved At',
      'Year Head Approved',
      'Year Head Approved By',
      'Year Head Approved At',
      'Final Approved By',
      'Final Approved At'
    ],
    rows: students.map(student => [
      student.studentId,
      student.name,
      student.email,
      student.grade,
      student.section,
      student.hall || '',
      student.room || '',
      student.advisor || '',
      student.yearHead || '',
      student.teacher || '',
      student.finalClearanceStatus,
      student.confirmationCode || '',
      student.outstandingBalance || 0,
      student.approvalStatus.stationStaffApproval ? 'Yes' : 'No',
      student.approvalStatus.stationStaffApprovedBy || '',
      student.approvalStatus.stationStaffApprovedAt || '',
      student.approvalStatus.teacherApproval ? 'Yes' : 'No',
      student.approvalStatus.teacherApprovedBy || '',
      student.approvalStatus.teacherApprovedAt || '',
      student.approvalStatus.hallHeadApproval ? 'Yes' : 'No',
      student.approvalStatus.hallHeadApprovedBy || '',
      student.approvalStatus.hallHeadApprovedAt || '',
      student.approvalStatus.advisorApproval ? 'Yes' : 'No',
      student.approvalStatus.advisorApprovedBy || '',
      student.approvalStatus.advisorApprovedAt || '',
      student.approvalStatus.yearHeadApproval ? 'Yes' : 'No',
      student.approvalStatus.yearHeadApprovedBy || '',
      student.approvalStatus.yearHeadApprovedAt || '',
      student.finalApprovedBy || '',
      student.finalApprovedAt || ''
    ])
  });

  // Sheet 2: Item Returns with Timestamps
  const itemReturns = registrations.filter(reg => reg.status === 'returned');
  sheets.push({
    name: '2_Item_Returns',
    headers: [
      'Student ID',
      'Student Name',
      'Item Type',
      'Item Description',
      'Subject',
      'Serial Number',
      'Teacher',
      'Registered At',
      'Returned At',
      'Condition',
      'Days Held'
    ],
    rows: itemReturns.map(reg => {
      const registeredDate = new Date(reg.registeredAt);
      const returnedDate = reg.returnedAt ? new Date(reg.returnedAt) : new Date();
      const daysHeld = Math.floor((returnedDate.getTime() - registeredDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        reg.studentId,
        reg.studentName,
        reg.itemType,
        reg.itemDescription,
        reg.subject || '',
        reg.serialNumber,
        reg.teacherName,
        reg.registeredAt,
        reg.returnedAt || '',
        reg.condition || '',
        daysHeld
      ];
    })
  });

  // Sheet 3: Assigned Items by Teacher
  const assignedItems = registrations.filter(reg => reg.status === 'assigned');
  sheets.push({
    name: '3_Assigned_Items',
    headers: [
      'Student ID',
      'Student Name',
      'Item Type',
      'Item Description',
      'Subject',
      'Serial Number',
      'Teacher',
      'Registered At',
      'Status',
      'Days Since Assignment',
      'Issue Type',
      'Issue Description'
    ],
    rows: assignedItems.map(reg => {
      const registeredDate = new Date(reg.registeredAt);
      const daysSince = Math.floor((new Date().getTime() - registeredDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        reg.studentId,
        reg.studentName,
        reg.itemType,
        reg.itemDescription,
        reg.subject || '',
        reg.serialNumber,
        reg.teacherName,
        reg.registeredAt,
        reg.status,
        daysSince,
        reg.reportedIssue?.type || '',
        reg.reportedIssue?.description || ''
      ];
    })
  });

  // Sheet 4: Subject Materials Tracking
  const subjectMaterials = registrations.reduce((acc, reg) => {
    if (reg.subject) {
      if (!acc[reg.subject]) {
        acc[reg.subject] = {
          totalAssigned: 0,
          returned: 0,
          missing: 0,
          damaged: 0,
          assigned: 0
        };
      }
      
      acc[reg.subject].totalAssigned++;
      
      if (reg.status === 'returned') acc[reg.subject].returned++;
      else if (reg.status === 'missing') acc[reg.subject].missing++;
      else if (reg.status === 'damaged') acc[reg.subject].damaged++;
      else if (reg.status === 'assigned') acc[reg.subject].assigned++;
    }
    return acc;
  }, {} as Record<string, any>);

  sheets.push({
    name: '4_Subject_Materials',
    headers: [
      'Subject',
      'Total Items Assigned',
      'Returned',
      'Still Assigned',
      'Missing',
      'Damaged',
      'Return Rate %'
    ],
    rows: Object.entries(subjectMaterials).map(([subject, stats]) => {
      const returnRate = stats.totalAssigned > 0 
        ? ((stats.returned / stats.totalAssigned) * 100).toFixed(1)
        : '0';
      
      return [
        subject,
        stats.totalAssigned,
        stats.returned,
        stats.assigned,
        stats.missing,
        stats.damaged,
        returnRate
      ];
    })
  });

  // Sheet 5: Financial Status Report
  const financialData = students.filter(s => s.outstandingBalance && s.outstandingBalance > 0);
  sheets.push({
    name: '5_Financial_Status',
    headers: [
      'Student ID',
      'Name',
      'Grade',
      'Section',
      'Outstanding Balance',
      'Clearance Status',
      'Hall',
      'Email'
    ],
    rows: financialData.map(student => [
      student.studentId,
      student.name,
      student.grade,
      student.section,
      student.outstandingBalance || 0,
      student.finalClearanceStatus,
      student.hall || '',
      student.email
    ])
  });

  // Sheet 6: Approval Status Tracking
  sheets.push({
    name: '6_Approval_Status',
    headers: [
      'Student ID',
      'Name',
      'Station Staff',
      'Station Approved By',
      'Station Approved Date',
      'Teacher',
      'Teacher Approved By',
      'Teacher Approved Date',
      'Hall Head',
      'Hall Head Approved By',
      'Hall Head Approved Date',
      'Advisor',
      'Advisor Approved By',
      'Advisor Approved Date',
      'Year Head',
      'Year Head Approved By',
      'Year Head Approved Date',
      'All Approvals Complete'
    ],
    rows: students.map(student => {
      const allComplete = 
        student.approvalStatus.stationStaffApproval &&
        student.approvalStatus.teacherApproval &&
        student.approvalStatus.hallHeadApproval &&
        student.approvalStatus.advisorApproval &&
        (student.approvalStatus.yearHeadApproval ?? true);
      
      return [
        student.studentId,
        student.name,
        student.approvalStatus.stationStaffApproval ? 'Approved' : 'Pending',
        student.approvalStatus.stationStaffApprovedBy || '',
        student.approvalStatus.stationStaffApprovedAt || '',
        student.approvalStatus.teacherApproval ? 'Approved' : 'Pending',
        student.approvalStatus.teacherApprovedBy || '',
        student.approvalStatus.teacherApprovedAt || '',
        student.approvalStatus.hallHeadApproval ? 'Approved' : 'Pending',
        student.approvalStatus.hallHeadApprovedBy || '',
        student.approvalStatus.hallHeadApprovedAt || '',
        student.approvalStatus.advisorApproval ? 'Approved' : 'Pending',
        student.approvalStatus.advisorApprovedBy || '',
        student.approvalStatus.advisorApprovedAt || '',
        student.approvalStatus.yearHeadApproval ? 'Approved' : 'Pending',
        student.approvalStatus.yearHeadApprovedBy || '',
        student.approvalStatus.yearHeadApprovedAt || '',
        allComplete ? 'Yes' : 'No'
      ];
    })
  });

  downloadMultipleCSVs(sheets, `ALA_Clearance_Export_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Teacher Export: Item tracking and returns
 */
export function exportTeacherData(
  teacherId: string,
  teacherName: string,
  registrations: StudentItemRegistration[],
  students: Student[]
): void {
  // Filter registrations for this teacher
  const teacherRegistrations = registrations.filter(reg => reg.teacherId === teacherId);
  
  const sheets: ExcelSheet[] = [];

  // Sheet 1: Item Returns with Timestamps
  const itemReturns = teacherRegistrations.filter(reg => reg.status === 'returned');
  sheets.push({
    name: '1_Item_Returns',
    headers: [
      'Student ID',
      'Student Name',
      'Grade',
      'Item Type',
      'Item Description',
      'Subject',
      'Serial Number',
      'Registered At',
      'Returned At',
      'Condition',
      'Days Held'
    ],
    rows: itemReturns.map(reg => {
      const student = students.find(s => s.id === reg.studentId);
      const registeredDate = new Date(reg.registeredAt);
      const returnedDate = reg.returnedAt ? new Date(reg.returnedAt) : new Date();
      const daysHeld = Math.floor((returnedDate.getTime() - registeredDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        reg.studentId,
        reg.studentName,
        student?.grade || '',
        reg.itemType,
        reg.itemDescription,
        reg.subject || '',
        reg.serialNumber,
        reg.registeredAt,
        reg.returnedAt || '',
        reg.condition || '',
        daysHeld
      ];
    })
  });

  // Sheet 2: Currently Assigned Items
  const assignedItems = teacherRegistrations.filter(reg => reg.status === 'assigned');
  sheets.push({
    name: '2_Assigned_Items',
    headers: [
      'Student ID',
      'Student Name',
      'Grade',
      'Item Type',
      'Item Description',
      'Subject',
      'Serial Number',
      'Registered At',
      'Days Since Assignment',
      'Has Issues',
      'Issue Type',
      'Issue Description',
      'Issue Reported At'
    ],
    rows: assignedItems.map(reg => {
      const student = students.find(s => s.id === reg.studentId);
      const registeredDate = new Date(reg.registeredAt);
      const daysSince = Math.floor((new Date().getTime() - registeredDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        reg.studentId,
        reg.studentName,
        student?.grade || '',
        reg.itemType,
        reg.itemDescription,
        reg.subject || '',
        reg.serialNumber,
        reg.registeredAt,
        daysSince,
        reg.reportedIssue ? 'Yes' : 'No',
        reg.reportedIssue?.type || '',
        reg.reportedIssue?.description || '',
        reg.reportedIssue?.reportedAt || ''
      ];
    })
  });

  // Sheet 3: Subject Materials Summary
  const subjectMaterials = teacherRegistrations.reduce((acc, reg) => {
    const subject = reg.subject || 'No Subject';
    if (!acc[subject]) {
      acc[subject] = {
        calculator: { assigned: 0, returned: 0, missing: 0, damaged: 0 },
        textbook: { assigned: 0, returned: 0, missing: 0, damaged: 0 },
        it_equipment: { assigned: 0, returned: 0, missing: 0, damaged: 0 },
        sports_equipment: { assigned: 0, returned: 0, missing: 0, damaged: 0 }
      };
    }
    
    const itemType = reg.itemType;
    if (reg.status === 'assigned') acc[subject][itemType].assigned++;
    else if (reg.status === 'returned') acc[subject][itemType].returned++;
    else if (reg.status === 'missing') acc[subject][itemType].missing++;
    else if (reg.status === 'damaged') acc[subject][itemType].damaged++;
    
    return acc;
  }, {} as Record<string, any>);

  const materialRows: (string | number)[][] = [];
  Object.entries(subjectMaterials).forEach(([subject, types]) => {
    Object.entries(types).forEach(([itemType, stats]) => {
      const total = stats.assigned + stats.returned + stats.missing + stats.damaged;
      if (total > 0) {
        materialRows.push([
          subject,
          itemType.replace(/_/g, ' ').toUpperCase(),
          total,
          stats.assigned,
          stats.returned,
          stats.missing,
          stats.damaged,
          total > 0 ? ((stats.returned / total) * 100).toFixed(1) : '0'
        ]);
      }
    });
  });

  sheets.push({
    name: '3_Subject_Materials',
    headers: [
      'Subject',
      'Item Type',
      'Total Items',
      'Currently Assigned',
      'Returned',
      'Missing',
      'Damaged',
      'Return Rate %'
    ],
    rows: materialRows
  });

  // Sheet 4: Problem Items (Missing or Damaged)
  const problemItems = teacherRegistrations.filter(
    reg => reg.status === 'missing' || reg.status === 'damaged' || reg.reportedIssue
  );
  
  sheets.push({
    name: '4_Problem_Items',
    headers: [
      'Student ID',
      'Student Name',
      'Item Type',
      'Item Description',
      'Subject',
      'Serial Number',
      'Status',
      'Issue Type',
      'Issue Description',
      'Reported At',
      'Days Since Report'
    ],
    rows: problemItems.map(reg => {
      const student = students.find(s => s.id === reg.studentId);
      const reportDate = reg.reportedIssue?.reportedAt ? new Date(reg.reportedIssue.reportedAt) : null;
      const daysSince = reportDate 
        ? Math.floor((new Date().getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return [
        reg.studentId,
        reg.studentName,
        reg.itemType,
        reg.itemDescription,
        reg.subject || '',
        reg.serialNumber,
        reg.status,
        reg.reportedIssue?.type || reg.status,
        reg.reportedIssue?.description || '',
        reg.reportedIssue?.reportedAt || '',
        daysSince
      ];
    })
  });

  downloadMultipleCSVs(
    sheets, 
    `Teacher_${teacherName.replace(/\s+/g, '_')}_Export_${new Date().toISOString().split('T')[0]}`
  );
}
