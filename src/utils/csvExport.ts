import { Student, StudentItemRegistration, ClearanceItem } from '../types';

interface ExportData {
  students: Student[];
  clearanceItems: ClearanceItem[];
  itemRegistrations: StudentItemRegistration[];
}

export function exportStudentDataToCSV(data: ExportData) {
  const { students, clearanceItems, itemRegistrations } = data;
  
  // Create workbook with multiple sheets
  const sheets = {
    'Student Overview': generateStudentOverviewSheet(students, clearanceItems),
    'Item Returns': generateItemReturnsSheet(students, clearanceItems, itemRegistrations),
    'Assigned Items': generateAssignedItemsSheet(itemRegistrations),
    'Subject Materials': generateSubjectMaterialsSheet(itemRegistrations),
    'Financial Status': generateFinancialStatusSheet(students),
    'Approval Status': generateApprovalStatusSheet(students),
  };

  // Convert to CSV files (we'll create multiple CSV files or a single comprehensive one)
  downloadMultiSheetCSV(sheets);
}

function generateStudentOverviewSheet(students: Student[], clearanceItems: ClearanceItem[]): string[][] {
  const headers = [
    'Student ID',
    'Full Name',
    'Grade/Year Level',
    'Section',
    'Hall',
    'Student Email',
    'Teacher',
    'Advisor',
    'Year Head',
    'Overall Status',
    'Items Completed',
    'Items Pending',
    'Outstanding Balance',
    'Station Staff Approval',
    'Teacher Approval',
    'Hall Head Approval',
    'Advisor Approval',
    'Year Head Approval',
    'Final Clearance Status',
    'Confirmation Code',
    'Date Cleared',
    'Cleared By'
  ];

  const rows = students.map(student => {
    const requiredItems = clearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    const pendingItems = requiredItems.length - completedItems.length;

    const allApproved = student.approvalStatus.stationStaffApproval &&
                       student.approvalStatus.teacherApproval &&
                       student.approvalStatus.hallHeadApproval &&
                       student.approvalStatus.advisorApproval;

    return [
      student.studentId,
      student.name,
      student.grade,
      student.section,
      student.hall || '',
      student.email,
      student.teacher || '',
      student.advisor || '',
      student.yearHead || '',
      allApproved ? 'Cleared' : 'Pending',
      completedItems.length.toString(),
      pendingItems.toString(),
      student.outstandingBalance ? `$${student.outstandingBalance}` : '$0',
      student.approvalStatus.stationStaffApproval ? 'Yes' : 'No',
      student.approvalStatus.teacherApproval ? 'Yes' : 'No',
      student.approvalStatus.hallHeadApproval ? 'Yes' : 'No',
      student.approvalStatus.advisorApproval ? 'Yes' : 'No',
      student.approvalStatus.yearHeadApproval ? 'Yes' : 'No',
      student.finalClearanceStatus,
      student.confirmationCode || '',
      student.finalApprovedAt ? new Date(student.finalApprovedAt).toLocaleString() : '',
      student.finalApprovedBy || ''
    ];
  });

  return [headers, ...rows];
}

function generateItemReturnsSheet(students: Student[], clearanceItems: ClearanceItem[], itemRegistrations: StudentItemRegistration[]): string[][] {
  const headers = [
    'Student ID',
    'Student Name',
    'Grade',
    'Item Name',
    'Category',
    'Status',
    'Submitted/Returned Date',
    'Submitted/Returned Time',
    'Condition',
    'Received By',
    'Notes',
    'Serial Number (if assigned)'
  ];

  const rows: string[][] = [];

  students.forEach(student => {
    student.clearanceItems.forEach(clearanceItem => {
      const item = clearanceItems.find(ci => ci.id === clearanceItem.itemId);
      if (!item) return;

      // Check if there's an assigned item registration for this
      const registration = itemRegistrations.find(reg => 
        reg.studentId === student.id && 
        item.name.toLowerCase().includes(reg.itemType)
      );

      const dateTime = clearanceItem.completedAt ? new Date(clearanceItem.completedAt) : null;

      rows.push([
        student.studentId,
        student.name,
        student.grade,
        item.name,
        item.category,
        clearanceItem.status,
        dateTime ? dateTime.toLocaleDateString() : '',
        dateTime ? dateTime.toLocaleTimeString() : '',
        registration?.condition || 'N/A',
        clearanceItem.completedBy || '',
        clearanceItem.notes || '',
        registration?.serialNumber || ''
      ]);
    });
  });

  return [headers, ...rows];
}

function generateAssignedItemsSheet(itemRegistrations: StudentItemRegistration[]): string[][] {
  const headers = [
    'Student ID',
    'Student Name',
    'Subject',
    'Item Type',
    'Item Description',
    'Serial Number',
    'Teacher',
    'Assigned Date',
    'Status',
    'Returned Date',
    'Condition',
    'Reported Issue Type',
    'Issue Description',
    'Issue Reported Date'
  ];

  const rows = itemRegistrations.map(reg => [
    '', // Will need student ID from student object
    reg.studentName,
    reg.subject || '',
    reg.itemType,
    reg.itemDescription,
    reg.serialNumber,
    reg.teacherName,
    new Date(reg.registeredAt).toLocaleString(),
    reg.status,
    reg.returnedAt ? new Date(reg.returnedAt).toLocaleString() : '',
    reg.condition || '',
    reg.reportedIssue?.type || '',
    reg.reportedIssue?.description || '',
    reg.reportedIssue?.reportedAt ? new Date(reg.reportedIssue.reportedAt).toLocaleString() : ''
  ]);

  return [headers, ...rows];
}

function generateSubjectMaterialsSheet(itemRegistrations: StudentItemRegistration[]): string[][] {
  const headers = [
    'Subject',
    'Item Type',
    'Total Assigned',
    'Returned',
    'Missing',
    'Damaged',
    'Still Assigned'
  ];

  // Group by subject and item type
  const groupedData: Record<string, Record<string, {
    total: number;
    returned: number;
    missing: number;
    damaged: number;
    assigned: number;
  }>> = {};

  itemRegistrations.forEach(reg => {
    const subject = reg.subject || 'General';
    const itemType = reg.itemType;

    if (!groupedData[subject]) {
      groupedData[subject] = {};
    }

    if (!groupedData[subject][itemType]) {
      groupedData[subject][itemType] = {
        total: 0,
        returned: 0,
        missing: 0,
        damaged: 0,
        assigned: 0
      };
    }

    const stats = groupedData[subject][itemType];
    stats.total++;

    switch (reg.status) {
      case 'returned':
        stats.returned++;
        break;
      case 'missing':
        stats.missing++;
        break;
      case 'damaged':
        stats.damaged++;
        break;
      case 'assigned':
        stats.assigned++;
        break;
    }
  });

  const rows: string[][] = [];
  Object.entries(groupedData).forEach(([subject, items]) => {
    Object.entries(items).forEach(([itemType, stats]) => {
      rows.push([
        subject,
        itemType,
        stats.total.toString(),
        stats.returned.toString(),
        stats.missing.toString(),
        stats.damaged.toString(),
        stats.assigned.toString()
      ]);
    });
  });

  return [headers, ...rows];
}

function generateFinancialStatusSheet(students: Student[]): string[][] {
  const headers = [
    'Student ID',
    'Student Name',
    'Grade',
    'Hall',
    'Outstanding Balance',
    'Status'
  ];

  const rows = students.map(student => [
    student.studentId,
    student.name,
    student.grade,
    student.hall || '',
    student.outstandingBalance ? `$${student.outstandingBalance}` : '$0',
    (student.outstandingBalance || 0) > 0 ? 'Outstanding' : 'Cleared'
  ]);

  return [headers, ...rows];
}

function generateApprovalStatusSheet(students: Student[]): string[][] {
  const headers = [
    'Student ID',
    'Student Name',
    'Grade',
    'Station Staff',
    'Station Staff By',
    'Station Staff Date',
    'Teacher',
    'Teacher By',
    'Teacher Date',
    'Hall Head',
    'Hall Head By',
    'Hall Head Date',
    'Advisor',
    'Advisor By',
    'Advisor Date',
    'Year Head',
    'Year Head By',
    'Year Head Date',
    'Final Status',
    'Confirmation Code'
  ];

  const rows = students.map(student => [
    student.studentId,
    student.name,
    student.grade,
    student.approvalStatus.stationStaffApproval ? 'Approved' : 'Pending',
    student.approvalStatus.stationStaffApprovedBy || '',
    student.approvalStatus.stationStaffApprovedAt ? new Date(student.approvalStatus.stationStaffApprovedAt).toLocaleString() : '',
    student.approvalStatus.teacherApproval ? 'Approved' : 'Pending',
    student.approvalStatus.teacherApprovedBy || '',
    student.approvalStatus.teacherApprovedAt ? new Date(student.approvalStatus.teacherApprovedAt).toLocaleString() : '',
    student.approvalStatus.hallHeadApproval ? 'Approved' : 'Pending',
    student.approvalStatus.hallHeadApprovedBy || '',
    student.approvalStatus.hallHeadApprovedAt ? new Date(student.approvalStatus.hallHeadApprovedAt).toLocaleString() : '',
    student.approvalStatus.advisorApproval ? 'Approved' : 'Pending',
    student.approvalStatus.advisorApprovedBy || '',
    student.approvalStatus.advisorApprovedAt ? new Date(student.approvalStatus.advisorApprovedAt).toLocaleString() : '',
    student.approvalStatus.yearHeadApproval ? 'Approved' : 'Pending',
    student.approvalStatus.yearHeadApprovedBy || '',
    student.approvalStatus.yearHeadApprovedAt ? new Date(student.approvalStatus.yearHeadApprovedAt).toLocaleString() : '',
    student.finalClearanceStatus,
    student.confirmationCode || ''
  ]);

  return [headers, ...rows];
}

function downloadMultiSheetCSV(sheets: Record<string, string[][]>) {
  // For each sheet, create a separate CSV file
  Object.entries(sheets).forEach(([sheetName, data]) => {
    const csv = convertToCSV(data);
    downloadCSV(csv, `${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  });
}

function convertToCSV(data: string[][]): string {
  return data.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = cell.replace(/"/g, '""');
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Alternative: Create a single Excel-compatible file with sheet indicators
export function exportStudentDataToExcel(data: ExportData) {
  const { students, clearanceItems, itemRegistrations } = data;
  
  let excelContent = '';
  
  // Add each sheet with a header
  const sheets = {
    'Student Overview': generateStudentOverviewSheet(students, clearanceItems),
    'Item Returns': generateItemReturnsSheet(students, clearanceItems, itemRegistrations),
    'Assigned Items': generateAssignedItemsSheet(itemRegistrations),
    'Subject Materials': generateSubjectMaterialsSheet(itemRegistrations),
    'Financial Status': generateFinancialStatusSheet(students),
    'Approval Status': generateApprovalStatusSheet(students),
  };

  Object.entries(sheets).forEach(([sheetName, data], index) => {
    if (index > 0) {
      excelContent += '\n\n';
    }
    excelContent += `### ${sheetName} ###\n`;
    excelContent += convertToCSV(data);
  });

  downloadCSV(excelContent, `ALA_Clearance_Data_${new Date().toISOString().split('T')[0]}.csv`);
}
