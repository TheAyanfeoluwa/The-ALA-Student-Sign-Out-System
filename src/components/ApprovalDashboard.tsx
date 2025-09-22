import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth.tsx';
import { mockStudents, mockClearanceItems, mockStudentRequirements } from '../data/mockData';
import { Student, StudentRequirement } from '../types';
import { CheckCircle, Clock, AlertTriangle, Users, GraduationCap, Building, UserCheck, Plus, FileText } from 'lucide-react';
import alaLogo from 'figma:asset/98c862684db16b3b8a0d3e90ef2456b6acca8f4e.png';

export function ApprovalDashboard() {
  const { user, logout } = useAuth();
  const [processingStudents, setProcessingStudents] = useState<Set<string>>(new Set());
  const [showAddRequirement, setShowAddRequirement] = useState(false);
  const [requirementForm, setRequirementForm] = useState({
    studentId: '',
    requirement: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: ''
  });
  const [studentRequirements, setStudentRequirements] = useState<StudentRequirement[]>(mockStudentRequirements);

  // Get students based on user role
  const getRelevantStudents = (): Student[] => {
    switch (user?.role) {
      case 'teacher':
        return mockStudents.filter(student => student.teacher === user.name);
      case 'hall_head':
        return mockStudents.filter(student => 
          user.managedHalls?.includes(student.hall || '')
        );
      case 'advisor':
        return mockStudents.filter(student => 
          user.advisees?.includes(student.id)
        );
      default:
        return [];
    }
  };

  const relevantStudents = getRelevantStudents();

  // Filter students based on their readiness for approval
  const getStudentsReadyForApproval = (): Student[] => {
    return relevantStudents.filter(student => {
      // Check if all required items are completed
      const requiredItems = mockClearanceItems.filter(item => item.isRequired);
      const completedItems = student.clearanceItems.filter(item => 
        item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
      );
      const allItemsComplete = completedItems.length === requiredItems.length;
      
      // Check if station staff has approved
      const stationApproved = student.approvalStatus.stationStaffApproval;
      
      // Check role-specific approval status
      let roleSpecificApproval = false;
      switch (user?.role) {
        case 'teacher':
          roleSpecificApproval = !student.approvalStatus.teacherApproval;
          break;
        case 'hall_head':
          roleSpecificApproval = !student.approvalStatus.hallHeadApproval;
          break;
        case 'advisor':
          roleSpecificApproval = !student.approvalStatus.advisorApproval;
          break;
      }
      
      return allItemsComplete && stationApproved && roleSpecificApproval;
    });
  };

  const studentsReadyForApproval = getStudentsReadyForApproval();

  const handleApproval = async (studentId: string) => {
    setProcessingStudents(prev => new Set(prev).add(studentId));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const student = relevantStudents.find(s => s.id === studentId);
    toast.success(`${student?.name} approved successfully!`);
    
    setProcessingStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
  };

  const handleBulkApproval = async (students: Student[]) => {
    if (students.length === 0) return;
    
    const studentIds = students.map(s => s.id);
    setProcessingStudents(prev => new Set([...prev, ...studentIds]));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Approved ${students.length} student(s) successfully!`);
    
    setProcessingStudents(prev => {
      const newSet = new Set(prev);
      studentIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  };

  const handleAddRequirement = async () => {
    if (!requirementForm.studentId || !requirementForm.requirement) {
      toast.error('Please fill in all required fields');
      return;
    }

    const student = relevantStudents.find(s => s.id === requirementForm.studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    const newRequirement: StudentRequirement = {
      id: Date.now().toString(),
      studentId: requirementForm.studentId,
      teacherId: user?.id || '',
      teacherName: user?.name || '',
      requirement: requirementForm.requirement,
      dueDate: requirementForm.dueDate || undefined,
      priority: requirementForm.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: requirementForm.notes || undefined
    };

    setStudentRequirements(prev => [...prev, newRequirement]);
    
    toast.success(`Requirement added for ${student.name}`, {
      description: requirementForm.requirement
    });

    // Reset form
    setRequirementForm({
      studentId: '',
      requirement: '',
      dueDate: '',
      priority: 'medium',
      notes: ''
    });
    setShowAddRequirement(false);
  };

  const handleMarkRequirementComplete = async (requirementId: string) => {
    setStudentRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
        : req
    ));
    
    const requirement = studentRequirements.find(req => req.id === requirementId);
    if (requirement) {
      const student = relevantStudents.find(s => s.id === requirement.studentId);
      toast.success(`Requirement marked complete for ${student?.name}`);
    }
  };

  const canStudentBeApproved = (student: Student): boolean => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    const allItemsComplete = completedItems.length === requiredItems.length;
    
    return allItemsComplete && student.approvalStatus.stationStaffApproval;
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'teacher':
        return 'Teacher Dashboard';
      case 'hall_head':
        return 'Hall Head Dashboard';
      case 'advisor':
        return 'Advisor Dashboard';
      default:
        return 'Approval Dashboard';
    }
  };

  const getRoleSubtitle = () => {
    switch (user?.role) {
      case 'teacher':
        return 'Provide final teacher confirmation for your students';
      case 'hall_head':
        return 'Approve hall clearances for your managed halls';
      case 'advisor':
        return 'Approve clearances for your advisees';
      default:
        return 'Manage student approvals';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'teacher':
        return GraduationCap;
      case 'hall_head':
        return Building;
      case 'advisor':
        return UserCheck;
      default:
        return Users;
    }
  };

  const Icon = getRoleIcon();

  const getStudentApprovalStatus = (student: Student) => {
    switch (user?.role) {
      case 'teacher':
        return student.approvalStatus.teacherApproval;
      case 'hall_head':
        return student.approvalStatus.hallHeadApproval;
      case 'advisor':
        return student.approvalStatus.advisorApproval;
      default:
        return false;
    }
  };

  const getTeacherRequirements = () => {
    if (user?.role !== 'teacher') return [];
    return studentRequirements.filter(req => req.teacherId === user.id);
  };

  const teacherRequirements = getTeacherRequirements();

  const renderHallHeadRoomView = () => {
    if (user?.role !== 'hall_head') return null;

    // Group students by hall and room
    const studentsByHall = relevantStudents.reduce((acc, student) => {
      const hall = student.hall || 'Unknown Hall';
      if (!acc[hall]) acc[hall] = {};
      const room = student.room || 'Unknown Room';
      if (!acc[hall][room]) acc[hall][room] = [];
      acc[hall][room].push(student);
      return acc;
    }, {} as Record<string, Record<string, Student[]>>);

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Room-by-Room Approval</CardTitle>
          <CardDescription>
            Approve students organized by their hall rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(studentsByHall).map(([hall, rooms]) => (
              <div key={hall}>
                <h3 className="text-lg font-medium mb-4">{hall}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(rooms).map(([room, students]) => {
                    const allApproved = students.every(s => getStudentApprovalStatus(s));
                    const canApproveAll = students.every(s => canStudentBeApproved(s));
                    
                    return (
                      <Card key={room} className={`border-l-4 ${
                        allApproved ? 'border-l-green-400 bg-green-50' : 'border-l-yellow-400'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Room {room}</h4>
                            <Badge className={
                              allApproved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {allApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {students.map(student => (
                              <div key={student.id} className="flex items-center justify-between text-sm">
                                <span>{student.name}</span>
                                {getStudentApprovalStatus(student) ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : canStudentBeApproved(student) ? (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {!allApproved && canApproveAll && (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleBulkApproval(students)}
                              disabled={students.some(s => processingStudents.has(s.id))}
                            >
                              Approve Room
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTeacherRequirements = () => (
    <div className="space-y-6">
      {/* Add Requirement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Student Requirements
            </span>
            <Button 
              onClick={() => setShowAddRequirement(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Requirement
            </Button>
          </CardTitle>
          <CardDescription>
            Add and track specific requirements for your students
          </CardDescription>
        </CardHeader>
        {showAddRequirement && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student-select">Select Student</Label>
                <Select value={requirementForm.studentId} onValueChange={(value) => 
                  setRequirementForm(prev => ({ ...prev, studentId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.studentId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={requirementForm.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setRequirementForm(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="requirement">Requirement Description</Label>
              <Textarea
                id="requirement"
                placeholder="Describe what the student needs to complete..."
                value={requirementForm.requirement}
                onChange={(e) => setRequirementForm(prev => ({ ...prev, requirement: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due-date">Due Date (Optional)</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={requirementForm.dueDate}
                  onChange={(e) => setRequirementForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any additional details..."
                  value={requirementForm.notes}
                  onChange={(e) => setRequirementForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddRequirement}>Add Requirement</Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddRequirement(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Active Requirements</CardTitle>
          <CardDescription>
            Track requirements you've set for your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherRequirements.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No requirements added yet</p>
              <p className="text-sm text-muted-foreground">
                Click "Add Requirement" to create requirements for your students
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherRequirements.map((requirement) => {
                  const student = relevantStudents.find(s => s.id === requirement.studentId);
                  return (
                    <TableRow key={requirement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student?.studentId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{requirement.requirement}</p>
                          {requirement.notes && (
                            <p className="text-sm text-muted-foreground">{requirement.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          requirement.priority === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : requirement.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }>
                          {requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {requirement.dueDate ? new Date(requirement.dueDate).toLocaleDateString() : 'No due date'}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          requirement.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : requirement.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {requirement.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkRequirementComplete(requirement.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
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
                <p className="text-muted-foreground">{getRoleTitle()} - {getRoleSubtitle()}</p>
              </div>
            </div>
            <Button variant="maroon" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{relevantStudents.length}</div>
              <p className="text-xs text-muted-foreground">Under your supervision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ready for Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">{studentsReadyForApproval.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">
                {relevantStudents.filter(s => getStudentApprovalStatus(s)).length}
              </div>
              <p className="text-xs text-muted-foreground">By you</p>
            </CardContent>
          </Card>
        </div>

        {/* Teacher-specific tabs or regular content */}
        {user?.role === 'teacher' ? (
          <Tabs defaultValue="approvals" className="space-y-6">
            <TabsList>
              <TabsTrigger value="approvals">Student Approvals</TabsTrigger>
              <TabsTrigger value="requirements">Student Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="approvals">
              <div className="space-y-8">
                {/* Ready for Approval */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Students Ready for Approval</span>
                      {studentsReadyForApproval.length > 0 && (
                        <Button 
                          onClick={() => handleBulkApproval(studentsReadyForApproval)}
                          disabled={studentsReadyForApproval.some(s => processingStudents.has(s.id))}
                        >
                          Approve All ({studentsReadyForApproval.length})
                        </Button>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Students who have completed all requirements and are ready for your approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {studentsReadyForApproval.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No students ready for approval</p>
                        <p className="text-sm text-muted-foreground">
                          Students will appear here when they complete all requirements
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentsReadyForApproval.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Grade {student.grade} - {student.section}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">All items completed</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Station staff approved</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => handleApproval(student.id)}
                                  disabled={processingStudents.has(student.id)}
                                  size="sm"
                                >
                                  {processingStudents.has(student.id) ? 'Processing...' : 'Approve'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* All Students Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Students Overview</CardTitle>
                    <CardDescription>
                      Complete list of students under your supervision
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Item Progress</TableHead>
                          <TableHead>Station Status</TableHead>
                          <TableHead>Your Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relevantStudents.map((student) => {
                          const requiredItems = mockClearanceItems.filter(item => item.isRequired);
                          const completedItems = student.clearanceItems.filter(item => 
                            item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
                          );
                          const itemProgress = Math.round((completedItems.length / requiredItems.length) * 100);
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Grade {student.grade} - {student.section}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{student.studentId}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${itemProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{itemProgress}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  student.approvalStatus.stationStaffApproval 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }>
                                  {student.approvalStatus.stationStaffApproval ? 'Approved' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  getStudentApprovalStatus(student)
                                    ? 'bg-green-100 text-green-800' 
                                    : canStudentBeApproved(student)
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }>
                                  {getStudentApprovalStatus(student) 
                                    ? 'Approved' 
                                    : canStudentBeApproved(student) 
                                    ? 'Ready' 
                                    : 'Not Ready'
                                  }
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Important Notice for Teachers */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Teacher Approval Process:</strong> You can only approve students after they have 
                    submitted all required items and received station staff approval. Your approval is the final 
                    step in the teacher confirmation process.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="requirements">
              {renderTeacherRequirements()}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-8">
            {/* Hall Head Room View */}
            {renderHallHeadRoomView()}

            {/* Ready for Approval */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Students Ready for Approval</span>
                  {studentsReadyForApproval.length > 0 && (
                    <Button 
                      onClick={() => handleBulkApproval(studentsReadyForApproval)}
                      disabled={studentsReadyForApproval.some(s => processingStudents.has(s.id))}
                    >
                      Approve All ({studentsReadyForApproval.length})
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Students who have completed all requirements and are ready for your approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentsReadyForApproval.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No students ready for approval</p>
                    <p className="text-sm text-muted-foreground">
                      Students will appear here when they complete all requirements
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        {user?.role === 'hall_head' && <TableHead>Room</TableHead>}
                        <TableHead>Progress</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsReadyForApproval.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Grade {student.grade} - {student.section}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          {user?.role === 'hall_head' && (
                            <TableCell>
                              <Badge variant="outline">{student.hall} - {student.room}</Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">All items completed</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Station staff approved</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => handleApproval(student.id)}
                              disabled={processingStudents.has(student.id)}
                              size="sm"
                            >
                              {processingStudents.has(student.id) ? 'Processing...' : 'Approve'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* All Students Overview */}
            <Card>
              <CardHeader>
                <CardTitle>All Students Overview</CardTitle>
                <CardDescription>
                  Complete list of students under your supervision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      {user?.role === 'hall_head' && <TableHead>Room</TableHead>}
                      <TableHead>Item Progress</TableHead>
                      <TableHead>Station Status</TableHead>
                      <TableHead>Your Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relevantStudents.map((student) => {
                      const requiredItems = mockClearanceItems.filter(item => item.isRequired);
                      const completedItems = student.clearanceItems.filter(item => 
                        item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
                      );
                      const itemProgress = Math.round((completedItems.length / requiredItems.length) * 100);
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Grade {student.grade} - {student.section}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          {user?.role === 'hall_head' && (
                            <TableCell>
                              <Badge variant="outline">{student.hall} - {student.room}</Badge>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${itemProgress}%` }}
                                />
                              </div>
                              <span className="text-sm">{itemProgress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              student.approvalStatus.stationStaffApproval 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {student.approvalStatus.stationStaffApproval ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              getStudentApprovalStatus(student)
                                ? 'bg-green-100 text-green-800' 
                                : canStudentBeApproved(student)
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }>
                              {getStudentApprovalStatus(student) 
                                ? 'Approved' 
                                : canStudentBeApproved(student) 
                                ? 'Ready' 
                                : 'Not Ready'
                              }
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}