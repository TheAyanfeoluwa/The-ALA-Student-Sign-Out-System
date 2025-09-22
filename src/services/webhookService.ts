import { Student, ClearanceItem } from '../types';

/**
 * Webhook Service for Student Clearance System
 * 
 * This service handles sending webhook notifications when students complete their checkout process.
 * 
 * TRIGGER CONDITIONS:
 * - Student has submitted all required items that need physical submission (requiresSubmission: true)
 * - All required items have been checked off by station staff
 * - Station staff approval has not been previously granted (prevents duplicate webhooks)
 * - Triggered from StationStaffInterface.handleSaveProgress()
 * 
 * WEBHOOK URL: https://hook.eu2.make.com/mxme679lrjy9tq45fpyey4jogsr62zml
 * 
 * PAYLOAD INCLUDES:
 * - Complete student information
 * - List of all completed items with details and notes
 * - Summary statistics
 * - Metadata about the checkout completion
 */

export interface WebhookPayload {
  timestamp: string;
  student: {
    id: string;
    name: string;
    studentId: string;
    grade: string;
    section: string;
    email: string;
    hall?: string;
    room?: string;
    advisor?: string;
    teacher?: string;
  };
  completedItems: {
    id: string;
    name: string;
    category: string;
    description: string;
    completedAt: string;
    completedBy: string;
    notes?: string;
  }[];
  summary: {
    totalItemsSubmitted: number;
    allRequiredItemsCompleted: boolean;
    completionPercentage: number;
  };
  metadata: {
    source: 'station_staff_interface';
    version: '1.0';
    checkoutCompletedAt: string;
  };
}

const WEBHOOK_URL = 'https://hook.eu2.make.com/mxme679lrjy9tq45fpyey4jogsr62zml';

export async function sendCheckoutCompletedWebhook(
  student: Student,
  completedItems: ClearanceItem[],
  completedBy: string,
  notes: Record<string, string>
): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    // Build the webhook payload
    const payload: WebhookPayload = {
      timestamp: now,
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        grade: student.grade,
        section: student.section,
        email: student.email,
        hall: student.hall,
        room: student.room,
        advisor: student.advisor,
        teacher: student.teacher,
      },
      completedItems: completedItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        completedAt: now,
        completedBy: completedBy,
        notes: notes[item.id] || undefined,
      })),
      summary: {
        totalItemsSubmitted: completedItems.length,
        allRequiredItemsCompleted: true,
        completionPercentage: 100,
      },
      metadata: {
        source: 'station_staff_interface',
        version: '1.0',
        checkoutCompletedAt: now,
      },
    };

    console.log('Sending webhook payload:', payload);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    console.log('Webhook sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send webhook:', error);
    return false;
  }
}

// Alternative function to send webhook with raw student data for testing
export async function sendTestWebhook(student: Student, checkedItemIds: string[]): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    
    const payload = {
      timestamp: now,
      eventType: 'student_checkout_completed',
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        grade: student.grade,
        section: student.section,
        email: student.email,
        hall: student.hall,
        room: student.room,
        advisor: student.advisor,
        teacher: student.teacher,
      },
      checkedItems: checkedItemIds,
      allClearanceItems: student.clearanceItems,
      approvalStatus: student.approvalStatus,
      finalClearanceStatus: student.finalClearanceStatus,
      checkoutCompletedAt: now,
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send test webhook:', error);
    return false;
  }
}