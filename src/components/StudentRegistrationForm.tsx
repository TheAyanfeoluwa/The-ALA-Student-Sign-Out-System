import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { UserPlus, Save, X } from 'lucide-react';
import { mockStudents, mockUsers, mockClearanceItems } from '../data/mockData';
import { Student, User, ClearanceStatus } from '../types';

interface StudentRegistrationFormProps {
  open: boolean;
  onClose: () => void;
  onStudentAdded: (student: Student) => void;
}

export function StudentRegistrationForm({ open, onClose, onStudentAdded }: StudentRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    grade: '',
    hall: '',
    room: '',
    advisor: 'Ms. Catherine Delight',
    teachers: [] as string[],
    yearHead: 'Ms. Sebabatso',
    outstandingBalance: '0'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const halls = ['West Wing', 'East Wing'];
  const grades = ['Year 1', 'Year 2'];
  const availableTeachers = [
    'Ismail Adeleke',
    'Dr. Sarah Johnson',
    'Prof. Michael Chen',
    'Ms. Lisa Thompson',
    'Dr. James Wilson',
    'Ms. Rebecca Martinez'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeacherToggle = (teacher: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      teachers: checked 
        ? [...prev.teachers, teacher]
        : prev.teachers.filter(t => t !== teacher)
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.studentId.trim()) errors.push('Student ID is required');
    if (!formData.grade) errors.push('Grade is required');
    if (!formData.hall) errors.push('Hall is required');
    if (!formData.room.trim()) errors.push('Room number is required');
    if (formData.teachers.length === 0) errors.push('At least one teacher must be selected');
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Check if email already exists
    const emailExists = mockUsers.some(user => user.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      errors.push('A user with this email already exists');
    }
    
    // Check if student ID already exists
    const studentIdExists = mockStudents.some(student => student.studentId === formData.studentId);
    if (studentIdExists) {
      errors.push('A student with this ID already exists');
    }
    
    // Validate outstanding balance
    const balance = parseFloat(formData.outstandingBalance);
    if (isNaN(balance) || balance < 0) {
      errors.push('Outstanding balance must be a valid number (0 or greater)');
    }

    return errors;
  };

  const createClearanceItems = (studentId: string, outstandingBalance: number): ClearanceStatus[] => {
    return mockClearanceItems.map(item => ({
      itemId: item.id,
      studentId: studentId,
      status: item.id === '7' && outstandingBalance > 0 ? 'action_required' : 'pending',
      ...(item.id === '7' && outstandingBalance > 0 && { outstandingAmount: outstandingBalance })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStudentId = (mockStudents.length + 1).toString();
      const outstandingBalance = parseFloat(formData.outstandingBalance);

      // Create new student
      const newStudent: Student = {
        id: newStudentId,
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        grade: formData.grade,
        section: '',
        email: formData.email.trim(),
        hall: formData.hall,
        room: formData.room.trim(),
        advisor: formData.advisor,
        teacher: formData.teachers.join(', '),
        yearHead: formData.yearHead,
        outstandingBalance: outstandingBalance,
        clearanceItems: createClearanceItems(newStudentId, outstandingBalance),
        approvalStatus: {
          studentId: newStudentId,
          stationStaffApproval: false,
          teacherApproval: false,
          hallHeadApproval: false,
          advisorApproval: false
        },
        finalClearanceStatus: 'pending'
      };

      // Create new user account
      const newUser: User = {
        id: (mockUsers.length + 1).toString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: 'student',
        studentInfo: newStudent
      };

      // Add to mock data (in real app, this would be API calls)
      mockStudents.push(newStudent);
      mockUsers.push(newUser);

      // Call the callback to update parent component
      onStudentAdded(newStudent);

      toast.success(`Student ${formData.name} has been successfully registered!`);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        studentId: '',
        grade: '',
        hall: '',
        room: '',
        advisor: 'Ms. Catherine Delight',
        teachers: [],
        yearHead: 'Ms. Sebabatso',
        outstandingBalance: '0'
      });

      onClose();
    } catch (error) {
      toast.error('Failed to register student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Register New Student
          </DialogTitle>
          <DialogDescription>
            Add a new student to the African Leadership Academy clearance system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter student's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@alastudents.org"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    placeholder="ALA2024-XXX"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accommodation Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accommodation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hall">Hall *</Label>
                  <Select value={formData.hall} onValueChange={(value) => handleInputChange('hall', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hall" />
                    </SelectTrigger>
                    <SelectContent>
                      {halls.map(hall => (
                        <SelectItem key={hall} value={hall}>{hall}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room">Room Number *</Label>
                  <Input
                    id="room"
                    placeholder="e.g., 204"
                    value={formData.room}
                    onChange={(e) => handleInputChange('room', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teachers Selection */}
              <div>
                <Label className="text-base">Teachers *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select all teachers that this student will be assigned to
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-lg">
                  {availableTeachers.map((teacher) => (
                    <div key={teacher} className="flex items-center space-x-2">
                      <Checkbox
                        id={`teacher-${teacher}`}
                        checked={formData.teachers.includes(teacher)}
                        onCheckedChange={(checked) => handleTeacherToggle(teacher, checked as boolean)}
                      />
                      <Label
                        htmlFor={`teacher-${teacher}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {teacher}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.teachers.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {formData.teachers.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="advisor">Advisor</Label>
                  <Input
                    id="advisor"
                    value={formData.advisor}
                    onChange={(e) => handleInputChange('advisor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="yearHead">Year Head</Label>
                  <Input
                    id="yearHead"
                    value={formData.yearHead}
                    onChange={(e) => handleInputChange('yearHead', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="outstandingBalance">Outstanding Balance ($)</Label>
                <Input
                  id="outstandingBalance"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.outstandingBalance}
                  onChange={(e) => handleInputChange('outstandingBalance', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Registering...' : 'Register Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StudentRegistrationTrigger() {
  const [showForm, setShowForm] = useState(false);

  const handleStudentAdded = (student: Student) => {
    // In a real app, this would trigger a refresh of the student list
    console.log('New student added:', student);
  };

  return (
    <>
      <Button 
        onClick={() => setShowForm(true)}
        className="bg-primary hover:bg-primary/90"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Register New Student
      </Button>

      <StudentRegistrationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onStudentAdded={handleStudentAdded}
      />
    </>
  );
}