import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth';
import { useDataStore } from '../hooks/useDataStore';
import { mockStudents, mockClasses, mockSubmissionStations } from '../data/mockData';
import { Student } from '../types';
import { GraduationCap, Users, Building, Package, CheckCircle, Clock, Download, AlertTriangle, XCircle } from 'lucide-react';
import { exportTeacherData } from '../utils/excelExport';

export function FacultyDashboard() {
  const { user, logout } = useAuth();
  const { students, studentItemRegistrations, updateStudentItemRegistration } = useDataStore();
  const [processingStudents, setProcessingStudents] = useState<Set<string>>(new Set());
  const [resolvingIssue, setResolvingIssue] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

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

  const handleExportData = () => {
    if (!user) return;
    
    exportTeacherData(
      user.id,
      user.name,
      studentItemRegistrations,
      students
    );
    
    toast.success('Teacher data exported successfully! Check your downloads folder for all files.');
  };

  const handleResolveIssue = (itemId: string) => {
    if (!user) return;

    const item = studentItemRegistrations.find(i => i.id === itemId);
    if (!item || !item.reportedIssue) return;

    updateStudentItemRegistration(itemId, {
      reportedIssue: {
        ...item.reportedIssue,
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: user.name,
        resolutionNotes: resolutionNotes || undefined
      }
    });

    toast.success('Issue marked as resolved');
    setResolvingIssue(null);
    setResolutionNotes('');
  };

  // Get reported items for this teacher
  const reportedItems = studentItemRegistrations.filter(item => 
    item.teacherId === user?.id && 
    item.reportedIssue && 
    !item.reportedIssue.resolved
  );

  const resolvedItems = studentItemRegistrations.filter(item => 
    item.teacherId === user?.id && 
    item.reportedIssue?.resolved
  );

  const getStudentClearanceStatus = (student: Student, itemId: string) => {
    const clearanceItem = student.clearanceItems.find(item => item.itemId === itemId);
    return clearanceItem?.status === 'completed';
  };

  const renderTeacherView = () => (
    <div className="space-y-6">
      {/* Export Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Teacher Data
            </span>
            <Button onClick={handleExportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download All Sheets
            </Button>
          </CardTitle>
          <CardDescription>
            Download comprehensive data including item returns, assigned items, and subject materials tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>• 1_Item_Returns - Returns with timestamps & condition</div>
            <div>• 2_Assigned_Items - Currently assigned with issues</div>
            <div>• 3_Subject_Materials - Summary by subject & type</div>
            <div>• 4_Problem_Items - Missing/Damaged items</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Note: Each sheet downloads as a separate CSV file named with your teacher name.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="classes">My Classes</TabsTrigger>
          <TabsTrigger value="reported">
            Reported Issues
            {reportedItems.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800 px-2 py-0.5">
                {reportedItems.length}
              </Badge>
            )}
          </TabsTrigger>
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

      <TabsContent value="reported">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reported Item Issues
              {reportedItems.length > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {reportedItems.length} Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Students have reported issues with assigned items. Review and mark as resolved when fixed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportedItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground">No unresolved issues</p>
                <p className="text-sm text-muted-foreground mt-2">All reported issues have been resolved</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportedItems.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {item.reportedIssue?.type === 'missing' ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                            )}
                            <h4 className="font-medium">
                              {item.reportedIssue?.type === 'missing' ? 'Missing Item' : 'Damaged Item'}
                            </h4>
                            <Badge className={
                              item.reportedIssue?.type === 'missing' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }>
                              {item.reportedIssue?.type}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p><strong>Item:</strong> {item.itemDescription}</p>
                            <p><strong>Serial Number:</strong> <code className="px-2 py-0.5 bg-muted rounded">{item.serialNumber}</code></p>
                            <p><strong>Student:</strong> {item.studentName}</p>
                            <p><strong>Subject:</strong> {item.subject || 'General'}</p>
                            <p><strong>Reported:</strong> {new Date(item.reportedIssue?.reportedAt || '').toLocaleString()}</p>
                            <p className="text-muted-foreground italic">
                              <strong>Description:</strong> {item.reportedIssue?.description}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <Button
                            size="sm"
                            onClick={() => setResolvingIssue(item.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Resolved Items Section */}
            {resolvedItems.length > 0 && (
              <div className="mt-8">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Recently Resolved ({resolvedItems.length})
                </h4>
                <div className="space-y-2">
                  {resolvedItems.slice(0, 5).map((item) => (
                    <Card key={item.id} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p><strong>{item.itemDescription}</strong> - {item.studentName}</p>
                            <p className="text-xs text-muted-foreground">
                              Resolved by {item.reportedIssue?.resolvedBy} on{' '}
                              {new Date(item.reportedIssue?.resolvedAt || '').toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        </div>
                        {item.reportedIssue?.resolutionNotes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            Note: {item.reportedIssue.resolutionNotes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Resolve Issue Dialog */}
      <Dialog open={resolvingIssue !== null} onOpenChange={(open) => {
        if (!open) {
          setResolvingIssue(null);
          setResolutionNotes('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Issue as Resolved</DialogTitle>
            <DialogDescription>
              Confirm that this item issue has been resolved. You can optionally add notes about the resolution.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {resolvingIssue && (() => {
              const item = studentItemRegistrations.find(i => i.id === resolvingIssue);
              return item ? (
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm"><strong>Item:</strong> {item.itemDescription}</p>
                  <p className="text-sm"><strong>Serial Number:</strong> {item.serialNumber}</p>
                  <p className="text-sm"><strong>Student:</strong> {item.studentName}</p>
                  <p className="text-sm"><strong>Issue Type:</strong> {item.reportedIssue?.type}</p>
                </div>
              ) : null;
            })()}

            <div className="space-y-2">
              <Label htmlFor="resolutionNotes">Resolution Notes (Optional)</Label>
              <Textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add any notes about how this issue was resolved..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setResolvingIssue(null);
              setResolutionNotes('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={() => resolvingIssue && handleResolveIssue(resolvingIssue)}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
