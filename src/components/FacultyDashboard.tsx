import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth';
import { mockStudents, mockClasses, mockSubmissionStations } from '../data/mockData';
import { Student } from '../types';
import { GraduationCap, Users, Building, Package, CheckCircle, Clock } from 'lucide-react';

export function FacultyDashboard() {
  const { user, logout } = useAuth();
  const [processingStudents, setProcessingStudents] = useState<Set<string>>(new Set());

  // Get relevant data based on user role
  const getUserData = () => {
    switch (user?.role) {
      case 'teacher':
        const teacherClasses = mockClasses.filter(cls => 
          user.teacherClasses?.includes(cls.id)
        );
        return {
          title: 'Teacher Dashboard',
          subtitle: 'Approve class clearance for your students',
          icon: GraduationCap,
          data: teacherClasses
        };
      
      case 'hall_head':
        const hallStudents = mockStudents.filter(student => 
          user.managedHalls?.includes(student.hall || '')
        );
        return {
          title: 'Hall Head Dashboard',
          subtitle: 'Manage dormitory clearances',
          icon: Building,
          data: [{ id: 'hall', name: user.managedHalls?.[0] || 'Hall', students: hallStudents }]
        };
      
      case 'station_staff':
        const stations = mockSubmissionStations.filter(station =>
          user.stationAccess?.includes(station.id)
        );
        return {
          title: 'Submission Station',
          subtitle: 'Process item submissions',
          icon: Package,
          data: stations
        };
      
      default:
        return {
          title: 'Faculty Dashboard',
          subtitle: 'Manage student clearances',
          icon: Users,
          data: []
        };
    }
  };

  const { title, subtitle, icon: Icon, data } = getUserData();

  const handleStudentClearance = async (studentId: string, approved: boolean) => {
    setProcessingStudents(prev => new Set(prev).add(studentId));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const studentName = mockStudents.find(s => s.id === studentId)?.name;
    toast.success(
      approved 
        ? `${studentName} cleared successfully!`
        : `${studentName} clearance removed.`
    );
    
    setProcessingStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
  };

  const handleBulkClearance = async (students: Student[]) => {
    const studentIds = students.map(s => s.id);
    setProcessingStudents(prev => new Set([...prev, ...studentIds]));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Cleared ${students.length} students successfully!`);
    
    setProcessingStudents(prev => {
      const newSet = new Set(prev);
      studentIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  };

  const getStudentClearanceStatus = (student: Student, itemId: string) => {
    const clearanceItem = student.clearanceItems.find(item => item.itemId === itemId);
    return clearanceItem?.status === 'completed';
  };

  const renderTeacherView = () => (
    <Tabs defaultValue="classes" className="space-y-6">
      <TabsList>
        <TabsTrigger value="classes">My Classes</TabsTrigger>
        <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
      </TabsList>

      <TabsContent value="classes" className="space-y-4">
        {data.map((classInfo: any) => (
          <Card key={classInfo.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{classInfo.name}</span>
                <Button 
                  onClick={() => handleBulkClearance(classInfo.students)}
                  disabled={classInfo.students.some((s: Student) => processingStudents.has(s.id))}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Clear All Students
                </Button>
              </CardTitle>
              <CardDescription>
                {classInfo.students.length} students in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classInfo.students.map((student: Student) => {
                    const isCleared = getStudentClearanceStatus(student, '6'); // Class attendance item
                    const isProcessing = processingStudents.has(student.id);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p>{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Grade {student.grade} - {student.section}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>
                          <Badge className={isCleared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {isCleared ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Cleared
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isCleared}
                              disabled={isProcessing}
                              onCheckedChange={(checked) => handleStudentClearance(student.id, checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {isProcessing ? 'Processing...' : 'Clear Student'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Students awaiting your class clearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderHallHeadView = () => (
    <div className="space-y-6">
      {data.map((hall: any) => (
        <Card key={hall.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{hall.name} Clearances</span>
              <Button 
                onClick={() => handleBulkClearance(hall.students)}
                disabled={hall.students.some((s: Student) => processingStudents.has(s.id))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Clear All Rooms
              </Button>
            </CardTitle>
            <CardDescription>
              Manage dormitory clearances for {hall.students.length} students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Room Status</TableHead>
                  <TableHead>Hall Clearance</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hall.students.map((student: Student) => {
                  const isCleared = getStudentClearanceStatus(student, '7'); // Hall clearance item
                  const isProcessing = processingStudents.has(student.id);
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p>{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Room Inspected</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={isCleared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {isCleared ? 'Cleared' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={isCleared}
                            disabled={isProcessing}
                            onCheckedChange={(checked) => handleStudentClearance(student.id, checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {isProcessing ? 'Processing...' : 'Clear Hall'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStationView = () => (
    <div className="space-y-6">
      {data.map((station: any) => (
        <Card key={station.id}>
          <CardHeader>
            <CardTitle>{station.name}</CardTitle>
            <CardDescription>
              Location: {station.location} | Staff: {station.staffInCharge}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">Items Submitted Today</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-muted-foreground">Pending Verification</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-muted-foreground">This Month</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending submissions</p>
                <p className="text-sm text-muted-foreground">Students will check in here to submit items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (user?.role) {
      case 'teacher':
        return renderTeacherView();
      case 'hall_head':
        return renderHallHeadView();
      case 'station_staff':
        return renderStationView();
      default:
        return <div>No content available for this role.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Icon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1>{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}