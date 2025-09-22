import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth.tsx';
import { mockStudents, mockClearanceItems } from '../data/mockData';
import { Student, ClearanceItem } from '../types';
import { sendCheckoutCompletedWebhook } from '../services/webhookService';
import { Search, User, CheckCircle, Clock, Package, Save, ArrowLeft } from 'lucide-react';
import alaLogo from 'figma:asset/98c862684db16b3b8a0d3e90ef2456b6acca8f4e.png';

type InterfaceState = 'search' | 'student_details' | 'processing';

export function StationStaffInterface() {
  const { logout, user } = useAuth();
  const [interfaceState, setInterfaceState] = useState<InterfaceState>('search');
  const [studentSearch, setStudentSearch] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStudentSearch = () => {
    if (!studentSearch.trim()) {
      toast.error('Please enter a student ID or name');
      return;
    }

    const student = mockStudents.find(s => 
      s.studentId.toLowerCase() === studentSearch.toLowerCase() ||
      s.name.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (!student) {
      toast.error('Student not found. Please check the ID and try again.');
      return;
    }

    setCurrentStudent(student);
    
    // Pre-check already completed items
    const completedItems = new Set(
      student.clearanceItems
        .filter(item => item.status === 'completed')
        .map(item => item.itemId)
    );
    setCheckedItems(completedItems);
    
    setInterfaceState('student_details');
  };

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = new Set(checkedItems);
    if (checked) {
      newCheckedItems.add(itemId);
    } else {
      newCheckedItems.delete(itemId);
      // Remove notes for unchecked items
      const newNotes = { ...notes };
      delete newNotes[itemId];
      setNotes(newNotes);
    }
    setCheckedItems(newCheckedItems);
  };

  const handleNotesChange = (itemId: string, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }));
  };

  const handleSaveProgress = async () => {
    if (!currentStudent) return;

    setIsProcessing(true);

    // Simulate API call to update student progress
    await new Promise(resolve => setTimeout(resolve, 1500));

    const checkedCount = checkedItems.size;
    toast.success(`Updated ${checkedCount} item(s) for ${currentStudent.name}`);

    // Check if all required items are completed
    const requiredItems = mockClearanceItems.filter(item => item.isRequired && item.requiresSubmission);
    const allRequiredCompleted = requiredItems.every(item => checkedItems.has(item.id));

    if (allRequiredCompleted && !currentStudent.approvalStatus.stationStaffApproval) {
      // Auto-approve station staff clearance if all items are completed
      toast.success('All required items received! Station clearance approved.');

      // Send webhook notification that student has completed checkout
      try {
        const completedItemsData = mockClearanceItems.filter(item => checkedItems.has(item.id));
        const completedBy = user?.name || 'Station Staff';
        
        const webhookSent = await sendCheckoutCompletedWebhook(
          currentStudent,
          completedItemsData,
          completedBy,
          notes
        );

        if (webhookSent) {
          toast.success('Checkout completion notification sent successfully!', {
            description: `All items submitted for ${currentStudent.name}`
          });
        } else {
          toast.error('Failed to send checkout notification', {
            description: 'Items processed but notification system had an error'
          });
        }
      } catch (error) {
        console.error('Webhook error:', error);
        toast.error('Notification system error', {
          description: 'Items processed successfully but notification failed'
        });
      }
    }

    setIsProcessing(false);
  };

  const resetInterface = () => {
    setInterfaceState('search');
    setStudentSearch('');
    setCurrentStudent(null);
    setCheckedItems(new Set());
    setNotes({});
  };

  const getItemStatus = (itemId: string) => {
    if (!currentStudent) return 'pending';
    const item = currentStudent.clearanceItems.find(ci => ci.itemId === itemId);
    return item?.status || 'pending';
  };

  const getCompletionProgress = () => {
    if (!currentStudent) return 0;
    const submissionItems = mockClearanceItems.filter(item => item.requiresSubmission);
    const completedItems = submissionItems.filter(item => checkedItems.has(item.id));
    return submissionItems.length > 0 ? Math.round((completedItems.length / submissionItems.length) * 100) : 0;
  };

  const renderSearchInterface = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-4 bg-secondary rounded-full w-16 h-16 flex items-center justify-center">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Reception - Item Processing</CardTitle>
        <CardDescription>
          Look up students to process their submitted items
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="studentSearch" className="text-lg">Student ID or Name</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="studentSearch"
                type="text"
                placeholder="Enter student ID (e.g., ALA2024-101) or name"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-12 text-lg h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
              />
            </div>
          </div>

          <Button 
            onClick={handleStudentSearch}
            disabled={!studentSearch.trim()}
            className="w-full h-12 text-lg"
          >
            <Search className="mr-2 h-5 w-5" />
            Look Up Student
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStudentDetails = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={resetInterface}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Completion Progress</p>
          <p className="text-xl font-semibold">{getCompletionProgress()}%</p>
        </div>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{currentStudent?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium">{currentStudent?.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade & Section</p>
              <p className="font-medium">{currentStudent?.grade} - {currentStudent?.section}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hall & Room</p>
              <p className="font-medium">{currentStudent?.hall} - Room {currentStudent?.room}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Advisor</p>
              <p className="font-medium">{currentStudent?.advisor}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teacher</p>
              <p className="font-medium">{currentStudent?.teacher}</p>
            </div>
          </div>

          {/* Approval Status */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Current Approval Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {currentStudent?.approvalStatus.stationStaffApproval ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <span>Station Staff</span>
              </div>
              <div className="flex items-center gap-2">
                {currentStudent?.approvalStatus.teacherApproval ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <span>Teacher</span>
              </div>
              <div className="flex items-center gap-2">
                {currentStudent?.approvalStatus.hallHeadApproval ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <span>Hall Head</span>
              </div>
              <div className="flex items-center gap-2">
                {currentStudent?.approvalStatus.advisorApproval ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <span>Advisor</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Items to Process</CardTitle>
          <CardDescription>
            Check off each item as it is received and verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockClearanceItems
              .filter(item => item.requiresSubmission)
              .map((item) => {
                const isChecked = checkedItems.has(item.id);
                const currentStatus = getItemStatus(item.id);
                
                return (
                  <Card key={item.id} className={`border-l-4 ${
                    isChecked ? 'border-l-green-400 bg-green-50' : 'border-l-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{item.name}</h4>
                                {item.isRequired && (
                                  <Badge variant="secondary" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          
                          <Badge className={
                            currentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {currentStatus === 'completed' ? 'Previously Received' : 'Pending'}
                          </Badge>
                        </div>

                        {isChecked && (
                          <div>
                            <Label htmlFor={`notes-${item.id}`} className="text-sm">
                              Notes (Optional)
                            </Label>
                            <Textarea
                              id={`notes-${item.id}`}
                              placeholder="Add any notes about the condition or details of the item..."
                              value={notes[item.id] || ''}
                              onChange={(e) => handleNotesChange(item.id, e.target.value)}
                              rows={2}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* Non-submission items for reference */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-muted-foreground mb-3">Other Requirements (Not Submitted Here)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mockClearanceItems
                .filter(item => !item.requiresSubmission)
                .map((item) => {
                  const status = getItemStatus(item.id);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {status === 'completed' ? 'Complete' : status === 'action_required' ? 'Action Required' : 'Pending'}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSaveProgress}
              disabled={isProcessing}
              className="px-8"
            >
              {isProcessing ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src={alaLogo} 
                alt="African Leadership Academy Logo" 
                className="h-12 w-12 object-contain mr-4"
              />
              <div>
                <h1 className="text-primary">African Leadership Academy</h1>
                <p className="text-muted-foreground">Reception Station - Process student item submissions</p>
              </div>
            </div>
            <Button variant="maroon" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {interfaceState === 'search' && renderSearchInterface()}
        {interfaceState === 'student_details' && renderStudentDetails()}
      </div>
    </div>
  );
}