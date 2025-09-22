import { mockStudents, mockClearanceItems } from '../data/mockData';
import { sendCheckoutCompletedWebhook, sendTestWebhook } from '../services/webhookService';

// Test function to verify webhook integration
export async function testWebhookWithSampleData() {
  // Use Hassiet Fisseha (student ID 3) who has all items completed in mock data
  const testStudent = mockStudents.find(s => s.id === '3');
  
  if (!testStudent) {
    console.error('Test student not found');
    return false;
  }

  // Get all required submission items
  const requiredSubmissionItems = mockClearanceItems.filter(
    item => item.isRequired && item.requiresSubmission
  );

  console.log('Testing webhook with student:', testStudent.name);
  console.log('Items to submit:', requiredSubmissionItems.map(i => i.name));

  // Test the webhook
  try {
    const success = await sendCheckoutCompletedWebhook(
      testStudent,
      requiredSubmissionItems,
      'Test Station Staff',
      {
        '1': 'All textbooks in good condition',
        '3': 'Locker key returned',
        '4': 'ID card in good condition',
        '6': 'Uniform items complete'
      }
    );

    if (success) {
      console.log('✅ Webhook test successful!');
      return true;
    } else {
      console.log('❌ Webhook test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook test error:', error);
    return false;
  }
}

// Test function with raw data
export async function testWebhookRawData() {
  const testStudent = mockStudents.find(s => s.id === '1');
  
  if (!testStudent) {
    console.error('Test student not found');
    return false;
  }

  const checkedItemIds = ['1', '2', '3', '4', '6']; // All required submission items

  try {
    const success = await sendTestWebhook(testStudent, checkedItemIds);
    
    if (success) {
      console.log('✅ Raw webhook test successful!');
      return true;
    } else {
      console.log('❌ Raw webhook test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Raw webhook test error:', error);
    return false;
  }
}

// Add this to window for easy browser console testing
if (typeof window !== 'undefined') {
  (window as any).testWebhook = testWebhookWithSampleData;
  (window as any).testWebhookRaw = testWebhookRawData;
}