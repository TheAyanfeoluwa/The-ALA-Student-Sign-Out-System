import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { mockStudents, mockClearanceItems, mockSubmissionStations } from '../data/mockData';
import { Student, ClearanceItem } from '../types';
import { Scan, CheckCircle, AlertTriangle, User, Package, ArrowRight, Home } from 'lucide-react';

type KioskState = 'welcome' | 'student_found' | 'submission_complete' | 'error';

interface SubmissionResult {
  success: boolean;
  message: string;
  student?: Student;
  items?: ClearanceItem[];
}

export function StudentCheckInKiosk() {
  const [kioskState, setKioskState] = useState<KioskState>('welcome');
  const [studentCode, setStudentCode] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [stationItems, setStationItems] = useState<ClearanceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mock current station - in real app, this would be determined by the kiosk location
  const currentStation = mockSubmissionStations[0]; // Academic Items Collection

  const handleStudentLookup = () => {
    if (!studentCode.trim()) {
      toast.error('Please enter a student code');
      return;
    }

    setIsProcessing(true);

    // Simulate lookup delay
    setTimeout(() => {
      const student = mockStudents.find(s => 
        s.studentId.toLowerCase() === studentCode.toLowerCase() ||
        s.name.toLowerCase().includes(studentCode.toLowerCase())
      );

      if (!student) {
        setKioskState('error');
        setErrorMessage('Student not found. Please check your student ID and try again.');
        setIsProcessing(false);
        return;
      }

      // Get items that can be submitted at this station
      const availableItems = mockClearanceItems.filter(item => 
        item.stationId === currentStation.id && 
        item.requiresSubmission
      );

      // Filter items that the student still needs to submit
      const pendingItems = availableItems.filter(item => {
        const status = student.clearanceItems.find(s => s.itemId === item.id);
        return !status || status.status !== 'completed';
      });

      if (pendingItems.length === 0) {
        setKioskState('error');
        setErrorMessage('You have no items to submit at this station. All your items for this station have been submitted.');
        setIsProcessing(false);
        return;
      }

      setCurrentStudent(student);
      setStationItems(pendingItems);
      setKioskState('student_found');
      setIsProcessing(false);
    }, 1500);
  };

  const handleItemToggle = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSubmission = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to submit');
      return;
    }

    setIsProcessing(true);

    // Simulate submission processing
    setTimeout(() => {
      // In a real app, this would update the database
      toast.success(`Successfully submitted ${selectedItems.size} item(s)!`);
      setKioskState('submission_complete');
      setIsProcessing(false);
    }, 2000);
  };

  const resetKiosk = () => {
    setKioskState('welcome');
    setStudentCode('');
    setCurrentStudent(null);
    setStationItems([]);
    setSelectedItems(new Set());
    setErrorMessage('');
  };

  const renderWelcomeScreen = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-6 p-6 bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center">
          <Package className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-3xl mb-2">
          {currentStation.name}
        </CardTitle>
        <p className="text-xl text-muted-foreground mb-2">
          {currentStation.location}
        </p>
        <p className="text-muted-foreground">
          Staff: {currentStation.staffInCharge}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl mb-4">Welcome! Please check in to submit your items.</h3>
          <p className="text-muted-foreground mb-6">
            Enter your student ID or name to get started
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="studentCode" className="text-lg">Student ID or Name</Label>
            <div className="relative mt-2">
              <Scan className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="studentCode"
                type="text"
                placeholder="Enter your student ID (e.g., ST2024001)"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="pl-12 text-lg h-14"
                onKeyPress={(e) => e.key === 'Enter' && handleStudentLookup()}
              />
            </div>
          </div>

          <Button 
            onClick={handleStudentLookup}
            disabled={isProcessing || !studentCode.trim()}
            className="w-full h-14 text-lg"
          >
            {isProcessing ? 'Looking up student...' : 'Check In'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Items accepted at this station:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {mockClearanceItems
              .filter(item => item.stationId === currentStation.id)
              .map(item => (
                <li key={item.id}>• {item.name}</li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  const renderStudentFoundScreen = () => (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Student Found</CardTitle>
              <p className="text-muted-foreground">Select items you're submitting today</p>
            </div>
          </div>
          <Button variant="outline" onClick={resetKiosk}>
            <Home className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Student Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium">Student Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 font-medium">{currentStudent?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 font-medium">{currentStudent?.studentId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Grade:</span>
              <span className="ml-2 font-medium">{currentStudent?.grade} - {currentStudent?.section}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Items to Submit */}
        <div>
          <h3 className="text-xl mb-4">Items Available for Submission</h3>
          <div className="space-y-3">
            {stationItems.map((item) => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-all ${
                  selectedItems.has(item.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleItemToggle(item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedItems.has(item.id) && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    {item.isRequired && (
                      <Badge variant="secondary">Required</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <p className="text-muted-foreground">
            {selectedItems.size} item(s) selected for submission
          </p>
          <Button 
            onClick={handleSubmission}
            disabled={isProcessing || selectedItems.size === 0}
            className="px-8 py-3 text-lg"
          >
            {isProcessing ? 'Processing...' : `Submit ${selectedItems.size} Item(s)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSubmissionCompleteScreen = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-6 p-6 bg-green-100 rounded-full w-24 h-24 flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle className="text-3xl text-green-700 mb-2">
          Submission Complete!
        </CardTitle>
        <p className="text-xl text-muted-foreground">
          Your items have been successfully submitted
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Thank you, {currentStudent?.name}!
          </h3>
          <p className="text-green-700 mb-4">
            {selectedItems.size} item(s) have been received and processed.
          </p>
          <p className="text-sm text-green-600">
            Your clearance status has been updated automatically.
            You can check your progress on the student portal.
          </p>
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Receipt has been sent to: {currentStudent?.email}
          </p>
          
          <Button onClick={resetKiosk} className="w-full h-12 text-lg">
            <Home className="h-5 w-5 mr-2" />
            Return to Welcome Screen
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderErrorScreen = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-6 p-6 bg-red-100 rounded-full w-24 h-24 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>
        <CardTitle className="text-3xl text-red-700 mb-2">
          Unable to Process
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Need help? Please contact the station staff:
          </p>
          <p className="font-medium">{currentStation.staffInCharge}</p>
          
          <Button onClick={resetKiosk} className="w-full h-12 text-lg">
            <Home className="h-5 w-5 mr-2" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {kioskState === 'welcome' && renderWelcomeScreen()}
        {kioskState === 'student_found' && renderStudentFoundScreen()}
        {kioskState === 'submission_complete' && renderSubmissionCompleteScreen()}
        {kioskState === 'error' && renderErrorScreen()}
      </div>
    </div>
  );
}