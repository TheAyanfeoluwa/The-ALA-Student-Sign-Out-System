import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAuth } from '../hooks/useAuth.tsx';
import { mockStudents, mockClearanceItems } from '../data/mockData';
import { Student } from '../types';
import { CheckCircle, Clock, Users, GraduationCap, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function YearHeadDashboard() {
  const { logout } = useAuth();
  const [processingStudents, setProcessingStudents] = useState<Set<string>>(new Set());

  // Get students ready for year head approval (100% requirements completed)
  const getStudentsReadyForYearHeadApproval = (): Student[] => {
    return mockStudents.filter(student => {
      // Check if all required items are completed
      const requiredItems = mockClearanceItems.filter(item => item.isRequired);
      const completedItems = student.clearanceItems.filter(item => 
        item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
      );
      const allItemsComplete = completedItems.length === requiredItems.length;
      
      // Check if all previous approvals are done
      const { stationStaffApproval, teacherApproval, hallHeadApproval, advisorApproval } = student.approvalStatus;
      const allPreviousApprovals = stationStaffApproval && teacherApproval && hallHeadApproval && advisorApproval;
      
      // Student is ready if 100% complete and all approvals done, but not yet approved by year head
      return allItemsComplete && allPreviousApprovals && !student.approvalStatus.yearHeadApproval;
    });
  };

  const studentsReadyForApproval = getStudentsReadyForYearHeadApproval();

  const handleApproval = async (studentId: string, approved: boolean) => {
    setProcessingStudents(prev => new Set(prev).add(studentId));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const student = mockStudents.find(s => s.id === studentId);
    if (approved) {
      toast.success(`${student?.name} final clearance approved!`, {
        description: 'Student clearance is now complete'
      });
    } else {
      toast.success(`${student?.name} clearance denied`, {
        description: 'Student has been notified'
      });
    }
    
    setProcessingStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
  };

  const handleBulkApproval = async () => {
    if (studentsReadyForApproval.length === 0) return;
    
    const studentIds = studentsReadyForApproval.map(s => s.id);
    setProcessingStudents(prev => new Set([...prev, ...studentIds]));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Approved ${studentsReadyForApproval.length} student(s) for final clearance!`);
    
    setProcessingStudents(new Set());
  };

  const getStudentProgressPercentage = (student: Student) => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    return Math.round((completedItems.length / requiredItems.length) * 100);
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ImageWithFallback 
                src="https://www.africanleadershipacademy.org/wp-content/uploads/2018/07/Aplicar-Etapa-1.png" 
                alt="African Leadership Academy Logo" 
                className="h-12 w-12 object-contain mr-4"
              />
              <div>
                <h1 className="text-primary">African Leadership Academy</h1>
                <p className="text-muted-foreground">Year Head Dashboard - Final clearance approvals</p>
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
              <div className="text-2xl">{mockStudents.length}</div>
              <p className="text-xs text-muted-foreground">In your year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ready for Final Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">{studentsReadyForApproval.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Completed Clearances</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">
                {mockStudents.filter(s => s.approvalStatus.yearHeadApproval).length}
              </div>
              <p className="text-xs text-muted-foreground">Final approvals given</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Ready for Approval */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Students Ready for Final Approval
              </span>
              {studentsReadyForApproval.length > 0 && (
                <Button 
                  onClick={handleBulkApproval}
                  disabled={studentsReadyForApproval.some(s => processingStudents.has(s.id))}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Approve All ({studentsReadyForApproval.length})
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Students who have completed 100% of requirements and received all approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentsReadyForApproval.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students ready for final approval</p>
                <p className="text-sm text-muted-foreground">
                  Students will appear here when they complete all requirements and receive all approvals
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Approvals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsReadyForApproval.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.grade} - {student.hall} Room {student.room}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            {getStudentProgressPercentage(student)}% Complete
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>All approvals received</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Station • Teacher • Hall Head • Advisor
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproval(student.id, true)}
                            disabled={processingStudents.has(student.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingStudents.has(student.id) ? 'Processing...' : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleApproval(student.id, false)}
                            disabled={processingStudents.has(student.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* All Students Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Students Overview</CardTitle>
            <CardDescription>
              Complete overview of all students and their clearance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Approvals Status</TableHead>
                  <TableHead>Final Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => {
                  const progress = getStudentProgressPercentage(student);
                  const { stationStaffApproval, teacherApproval, hallHeadApproval, advisorApproval, yearHeadApproval } = student.approvalStatus;
                  const approvalCount = [stationStaffApproval, teacherApproval, hallHeadApproval, advisorApproval].filter(Boolean).length;
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          progress === 100 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {progress}% Complete
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{approvalCount}/4 approvals</p>
                          <div className="flex gap-1 mt-1">
                            {[stationStaffApproval, teacherApproval, hallHeadApproval, advisorApproval].map((approved, index) => (
                              <div key={index} className={`w-2 h-2 rounded-full ${approved ? 'bg-green-500' : 'bg-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          yearHeadApproval 
                            ? 'bg-green-100 text-green-800'
                            : progress === 100 && approvalCount === 4
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {yearHeadApproval 
                            ? 'Approved' 
                            : progress === 100 && approvalCount === 4
                            ? 'Ready for Approval'
                            : 'In Progress'
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
    </div>
  );
}