import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../hooks/useAuth.tsx';
import { useDataStore } from '../hooks/useDataStore.tsx';
import { mockClearanceItems } from '../data/mockData';
import { Student } from '../types';
import { Search, Users, TrendingUp, CheckCircle, Clock, AlertTriangle, Eye, BarChart3, Calculator, Book, MonitorSpeaker, Shirt, Dumbbell, UserPlus, UserCog, Download, Shield } from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentRegistrationForm } from './StudentRegistrationForm';
import { StaffRegistrationForm } from './StaffRegistrationForm';
import { AdminUnlockRequests } from './AdminUnlockRequests';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { exportStudentDataToCSV, exportStudentDataToExcel } from '../utils/csvExport';
import { exportAdminData } from '../utils/excelExport';

export function SimplifiedAdminDashboard() {
  const { logout } = useAuth();
  const { students, addStudent, studentItemRegistrations, unlockRequests } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showStaffRegistrationForm, setShowStaffRegistrationForm] = useState(false);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real-time statistics
  const totalStudents = students.length;
  const completedStudents = students.filter(s => s.finalClearanceStatus === 'completed').length;
  const pendingStudents = totalStudents - completedStudents;
  
  // Students with all items submitted but pending approvals
  const awaitingApproval = students.filter(student => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    const allItemsComplete = completedItems.length === requiredItems.length;
    const hasOutstandingFinance = student.clearanceItems.some(item => item.status === 'action_required');
    
    return allItemsComplete && !hasOutstandingFinance && student.finalClearanceStatus === 'pending';
  }).length;

  // Students with outstanding finance
  const financeIssues = students.filter(student =>
    student.clearanceItems.some(item => item.status === 'action_required')
  ).length;

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleStudentAdded = (newStudent: Student) => {
    addStudent(newStudent);
    toast.success('Student successfully added to the system!');
  };



  const getStudentProgressPercentage = (student: Student) => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    return Math.round((completedItems.length / requiredItems.length) * 100);
  };

  const getApprovalProgress = (student: Student) => {
    const approvals = [
      student.approvalStatus.stationStaffApproval,
      student.approvalStatus.teacherApproval,
      student.approvalStatus.hallHeadApproval,
      student.approvalStatus.advisorApproval
    ];
    const completed = approvals.filter(Boolean).length;
    return Math.round((completed / approvals.length) * 100);
  };

  const getStudentStatusColor = (student: Student) => {
    if (student.finalClearanceStatus === 'completed') return 'bg-green-100 text-green-800';
    
    const hasActionRequired = student.clearanceItems.some(item => item.status === 'action_required');
    if (hasActionRequired) return 'bg-red-100 text-red-800';
    
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    const allItemsComplete = completedItems.length === requiredItems.length;
    
    if (allItemsComplete) return 'bg-amber-100 text-amber-800';
    
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStudentStatusText = (student: Student) => {
    if (student.finalClearanceStatus === 'completed') return 'Completed';
    
    const hasActionRequired = student.clearanceItems.some(item => item.status === 'action_required');
    if (hasActionRequired) return 'Action Required';
    
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    const allItemsComplete = completedItems.length === requiredItems.length;
    
    if (allItemsComplete) return 'Awaiting Approval';
    
    return 'In Progress';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{completedStudents}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedStudents / totalStudents) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Awaiting Approval</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-primary">{awaitingApproval}</div>
            <p className="text-xs text-muted-foreground">Ready for final approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Finance Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{financeIssues}</div>
            <p className="text-xs text-muted-foreground">Outstanding payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Progress Overview</CardTitle>
          <CardDescription>
            Live view of all student clearance statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => handleStudentSelect(student)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {student.studentId} | {student.grade}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">Items:</span>
                      <span className="text-sm font-medium">{getStudentProgressPercentage(student)}%</span>
                    </div>
                    <Progress value={getStudentProgressPercentage(student)} className="w-20 h-2" />
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">Approvals:</span>
                      <span className="text-sm font-medium">{getApprovalProgress(student)}%</span>
                    </div>
                    <Progress value={getApprovalProgress(student)} className="w-20 h-2" />
                  </div>
                  
                  <Badge className={getStudentStatusColor(student)}>
                    {getStudentStatusText(student)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getItemReturnStats = () => {
    const stats = mockClearanceItems.map(item => {
      const totalStudentsRequired = students.filter(student => 
        item.isRequired || student.clearanceItems.some(ci => ci.itemId === item.id)
      ).length;
      
      const studentsReturned = students.filter(student =>
        student.clearanceItems.some(ci => ci.itemId === item.id && ci.status === 'completed')
      ).length;
      
      return {
        item,
        returned: studentsReturned,
        total: totalStudentsRequired,
        percentage: totalStudentsRequired > 0 ? Math.round((studentsReturned / totalStudentsRequired) * 100) : 0
      };
    });
    return stats;
  };

  const handleExportCSV = () => {
    exportStudentDataToCSV({
      students,
      clearanceItems: mockClearanceItems,
      itemRegistrations: studentItemRegistrations
    });
    toast.success('CSV files downloaded successfully!');
  };

  const handleExportExcel = () => {
    exportAdminData(students, studentItemRegistrations);
    toast.success('6 Excel sheets downloaded successfully! Check your downloads folder for all files.');
  };

  const renderDataTab = () => {
    const itemStats = getItemReturnStats();
    
    return (
      <div className="space-y-6">
        {/* Export Data Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download comprehensive clearance data for record-keeping and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleExportCSV}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download Multiple CSV Files
              </Button>
              <Button 
                onClick={handleExportExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download All 6 Sheets (Multiple Files)
              </Button>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Export Includes (6 Separate CSV Files):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>• 1_Student_Overview - All student details</div>
                <div>• 2_Item_Returns - Returns with timestamps</div>
                <div>• 3_Assigned_Items - Current assignments</div>
                <div>• 4_Subject_Materials - Material tracking</div>
                <div>• 5_Financial_Status - Outstanding balances</div>
                <div>• 6_Approval_Status - All approvals</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Note: Each sheet downloads as a separate CSV file. You can import all files into Excel to create a multi-sheet workbook.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Item Return Statistics
            </CardTitle>
            <CardDescription>
              Track how many students have returned each required item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {itemStats.map(stat => {
                const getIcon = () => {
                  switch (stat.item.name) {
                    case 'Calculator': return <Calculator className="h-5 w-5 text-blue-600" />;
                    case 'Mathematics Textbook': return <Book className="h-5 w-5 text-green-600" />;
                    case 'Computer Science Textbook': return <MonitorSpeaker className="h-5 w-5 text-purple-600" />;
                    case 'Physics Textbook': return <Book className="h-5 w-5 text-orange-600" />;
                    case 'Uniform': return <Shirt className="h-5 w-5 text-red-600" />;
                    case 'Sports Equipment': return <Dumbbell className="h-5 w-5 text-gray-600" />;
                    default: return <CheckCircle className="h-5 w-5 text-gray-600" />;
                  }
                };

                return (
                  <Card key={stat.item.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getIcon()}
                        <div>
                          <h4 className="font-medium">{stat.item.name}</h4>
                          <p className="text-sm text-muted-foreground">{stat.item.description}</p>
                        </div>
                      </div>
                      <Badge className={
                        stat.percentage === 100 
                          ? 'bg-green-100 text-green-800'
                          : stat.percentage >= 75
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {stat.returned}/{stat.total} ({stat.percentage}%)
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Returned</span>
                        <span>{stat.returned} out of {stat.total} students</span>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Subject Materials
                </h4>
                <div className="space-y-2">
                  {itemStats
                    .filter(stat => stat.item.category === 'subject_materials')
                    .map(stat => (
                      <div key={stat.item.id} className="flex justify-between text-sm">
                        <span>{stat.item.name}</span>
                        <span>{stat.returned}/{stat.total}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shirt className="h-4 w-4" />
                  Other Requirements
                </h4>
                <div className="space-y-2">
                  {itemStats
                    .filter(stat => stat.item.category === 'other_requirements')
                    .map(stat => (
                      <div key={stat.item.id} className="flex justify-between text-sm">
                        <span>{stat.item.name}</span>
                        <span>{stat.returned}/{stat.total}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRegistrationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Register New Student
          </CardTitle>
          <CardDescription>
            Add new students to the African Leadership Academy clearance system. All students will be automatically enrolled with the required clearance items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Button 
              onClick={() => setShowRegistrationForm(true)}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Register New Student
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Registration Process:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Student account will be created automatically</li>
              <li>• All required clearance items will be assigned</li>
              <li>• Default advisors and year head will be assigned</li>
              <li>• Student will receive login credentials via email</li>
              <li>• Outstanding balances will create finance action items</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
          <CardDescription>
            Last 5 students registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.slice(-5).reverse().map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {student.studentId} | {student.grade} | {student.hall}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Registered
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffRegistrationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Register New Staff Member
          </CardTitle>
          <CardDescription>
            Create accounts for teachers, advisors, hall heads, and year heads to manage the clearance system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Button 
              onClick={() => setShowStaffRegistrationForm(true)}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              <UserCog className="h-5 w-5 mr-2" />
              Register New Staff
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Available Staff Roles:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Teacher</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Approve student clearances and manage class requirements
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Advisor</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Guide students through clearance process and provide approval
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Hall Head</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage hall clearances and approve students in assigned halls
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Year Head</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Oversee year-level clearances and final approvals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentLookupTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Student Search
        </CardTitle>
        <CardDescription>
          Search for students to view detailed clearance information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Students</Label>
            <Input
              id="search"
              placeholder="Enter student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4>{student.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.studentId} | {student.grade}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Teacher: {student.teacher} | Advisor: {student.advisor}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p>Items: {getStudentProgressPercentage(student)}%</p>
                        <p>Approvals: {getApprovalProgress(student)}%</p>
                      </div>
                      
                      <Badge className={getStudentStatusColor(student)}>
                        {getStudentStatusText(student)}
                      </Badge>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredStudents.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students found matching "{searchTerm}"</p>
              </div>
            )}
            
            {!searchTerm && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Enter a student name or ID to search</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                className="h-12 w-12 object-contain mr-4 rounded-lg"
              />
              <div>
                <h1 className="text-primary">African Leadership Academy</h1>
                <p className="text-muted-foreground">Admin Dashboard - Real-time progress tracking</p>
              </div>
            </div>
            <Button variant="maroon" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Real-time Overview</TabsTrigger>
            <TabsTrigger value="search">Student Search</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="register">Register Student</TabsTrigger>
            <TabsTrigger value="staff">Register Staff</TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1" />
              Security
              {unlockRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unlockRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="search">
            {renderStudentLookupTab()}
          </TabsContent>

          <TabsContent value="data">
            {renderDataTab()}
          </TabsContent>

          <TabsContent value="register">
            {renderRegistrationTab()}
          </TabsContent>

          <TabsContent value="staff">
            {renderStaffRegistrationTab()}
          </TabsContent>

          <TabsContent value="security">
            <AdminUnlockRequests />
          </TabsContent>
        </Tabs>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          open={showStudentModal}
          onClose={() => setShowStudentModal(false)}
        />
      )}

      {/* Student Registration Modal */}
      {showRegistrationForm && (
        <StudentRegistrationForm
          open={showRegistrationForm}
          onClose={() => setShowRegistrationForm(false)}
          onStudentAdded={handleStudentAdded}
        />
      )}

      {/* Staff Registration Modal */}
      {showStaffRegistrationForm && (
        <StaffRegistrationForm
          open={showStaffRegistrationForm}
          onClose={() => setShowStaffRegistrationForm(false)}
        />
      )}
    </div>
  );
}