import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { useDataStore } from '../hooks/useDataStore.tsx';
import { StudentItemRegistration } from '../types';
import { Package, Plus, Search, FileText } from 'lucide-react';

interface StudentItemRegistrationFormProps {
  teacherId: string;
  teacherName: string;
}

export function StudentItemRegistrationForm({ teacherId, teacherName }: StudentItemRegistrationFormProps) {
  const { students, studentItemRegistrations, addStudentItemRegistration } = useDataStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    serialNumber: '',
    itemType: '' as 'calculator' | 'textbook' | 'it_equipment' | 'sports_equipment' | '',
    itemDescription: ''
  });

  const subjects = [
    'Mathematics',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Economics',
    'Business Studies',
    'Art',
    'Music',
    'Physical Education',
    'Other'
  ];

  // Filter students taught by this teacher
  const myStudents = students.filter(student => 
    student.teacher?.includes(teacherName) || student.teacher === teacherName
  );

  // Filter registrations for this teacher
  const myRegistrations = studentItemRegistrations.filter(reg => reg.teacherId === teacherId);

  // Filter registrations based on search
  const filteredRegistrations = myRegistrations.filter(reg => 
    reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.serialNumber || !formData.itemType || !formData.itemDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    const student = myStudents.find(s => s.id === formData.studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    const newRegistration: StudentItemRegistration = {
      id: `reg-${Date.now()}`,
      studentId: formData.studentId,
      studentName: student.name,
      teacherId,
      teacherName,
      subject: formData.subject,
      serialNumber: formData.serialNumber,
      itemType: formData.itemType as 'calculator' | 'textbook' | 'it_equipment' | 'sports_equipment',
      itemDescription: formData.itemDescription,
      registeredAt: new Date().toISOString(),
      registeredBy: teacherName,
      status: 'assigned'
    };

    addStudentItemRegistration(newRegistration);
    toast.success(`Item registered to ${student.name} successfully!`);

    // Reset form
    setFormData({
      studentId: '',
      subject: '',
      serialNumber: '',
      itemType: '',
      itemDescription: ''
    });
    setShowAddForm(false);
  };

  const getItemTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      calculator: 'Calculator',
      textbook: 'Textbook',
      it_equipment: 'IT Equipment',
      sports_equipment: 'Sports Equipment'
    };
    return labels[type] || type;
  };

  const getItemTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      calculator: 'bg-blue-100 text-blue-800',
      textbook: 'bg-green-100 text-green-800',
      it_equipment: 'bg-purple-100 text-purple-800',
      sports_equipment: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Add Item Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item Registration
            </span>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showAddForm ? 'Cancel' : 'Register Item'}
            </Button>
          </CardTitle>
          <CardDescription>
            Register textbooks, calculators, and equipment to students with serial numbers
          </CardDescription>
        </CardHeader>

        {showAddForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Selection */}
                <div className="space-y-2">
                  <Label htmlFor="student">Student *</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                  >
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {myStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} - {student.studentId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Serial Number */}
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g., TXT-2024-001"
                  />
                </div>

                {/* Item Type */}
                <div className="space-y-2">
                  <Label htmlFor="itemType">Item Type *</Label>
                  <Select
                    value={formData.itemType}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      itemType: value as 'calculator' | 'textbook' | 'it_equipment' | 'sports_equipment' 
                    })}
                  >
                    <SelectTrigger id="itemType">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calculator">Calculator</SelectItem>
                      <SelectItem value="textbook">Textbook</SelectItem>
                      <SelectItem value="it_equipment">IT Equipment</SelectItem>
                      <SelectItem value="sports_equipment">Sports Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Item Description */}
                <div className="space-y-2">
                  <Label htmlFor="itemDescription">
                    Item Description *
                    {formData.itemType && (
                      <span className="text-muted-foreground ml-1">
                        ({getItemTypeLabel(formData.itemType)} details)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id="itemDescription"
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    placeholder={
                      formData.itemType === 'textbook' ? 'e.g., Mathematics Grade 10 Textbook' :
                      formData.itemType === 'calculator' ? 'e.g., Casio FX-991ES Plus Scientific Calculator' :
                      formData.itemType === 'it_equipment' ? 'e.g., HP Laptop - Model XYZ' :
                      formData.itemType === 'sports_equipment' ? 'e.g., Nike Soccer Ball Size 5' :
                      'Describe the item...'
                    }
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Register Item
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Registered Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registered Items ({myRegistrations.length})
          </CardTitle>
          <CardDescription>
            All items registered to your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, serial number, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {myRegistrations.length === 0 
                  ? 'No items registered yet' 
                  : 'No items match your search'}
              </p>
              <p className="text-sm text-muted-foreground">
                {myRegistrations.length === 0 
                  ? 'Click "Register Item" to assign items to students' 
                  : 'Try adjusting your search terms'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Item Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => {
                  const statusColors = {
                    assigned: 'bg-blue-100 text-blue-800',
                    returned: 'bg-green-100 text-green-800',
                    missing: 'bg-red-100 text-red-800',
                    damaged: 'bg-orange-100 text-orange-800'
                  };
                  
                  return (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div>
                          <div>{registration.studentName}</div>
                          <div className="text-sm text-muted-foreground">
                            {students.find(s => s.id === registration.studentId)?.studentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.subject ? (
                          <Badge variant="outline">{registration.subject}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {registration.serialNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getItemTypeBadgeColor(registration.itemType)}>
                          {getItemTypeLabel(registration.itemType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={registration.itemDescription}>
                          {registration.itemDescription}
                        </div>
                        {registration.reportedIssue && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠️ {registration.reportedIssue.type.toUpperCase()}: {registration.reportedIssue.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[registration.status]}>
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(registration.registeredAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
