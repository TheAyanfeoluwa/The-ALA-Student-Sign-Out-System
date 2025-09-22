import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { mockStudents, mockSystemStats, mockClearanceItems } from '../data/mockData';
import { Student } from '../types';
import { Search, Users, TrendingUp, AlertTriangle, DollarSign, BookOpen, Eye } from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';

export function AdminStatsDashboard() {
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const stats = mockSystemStats;

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart data
  const clearanceProgressData = [
    { name: 'Textbooks', completed: 85, pending: 15 },
    { name: 'Library Books', completed: 92, pending: 8 },
    { name: 'Finance', completed: 60, pending: 40 },
    { name: 'Class Attendance', completed: 78, pending: 22 },
    { name: 'Hall Clearance', completed: 88, pending: 12 }
  ];

  const departmentDelayData = [
    { department: 'Finance', delays: 23, color: '#ef4444' },
    { department: 'Library', delays: 8, color: '#f59e0b' },
    { department: 'Admin Office', delays: 12, color: '#3b82f6' },
    { department: 'Class Teachers', delays: 15, color: '#10b981' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const getStudentProgressPercentage = (student: Student) => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    return Math.round((completedItems.length / requiredItems.length) * 100);
  };

  const getStudentStatusColor = (student: Student) => {
    if (student.finalClearanceStatus === 'completed') return 'bg-green-100 text-green-800';
    
    const hasActionRequired = student.clearanceItems.some(item => item.status === 'action_required');
    if (hasActionRequired) return 'bg-red-100 text-red-800';
    
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStudentStatusText = (student: Student) => {
    if (student.finalClearanceStatus === 'completed') return 'Completed';
    
    const hasActionRequired = student.clearanceItems.some(item => item.status === 'action_required');
    if (hasActionRequired) return 'Action Required';
    
    return 'In Progress';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1>Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and student management</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Student Lookup</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Enrolled this year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Cleared Students</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{stats.clearedStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.clearedStudents / stats.totalStudents) * 100)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Pending Students</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-yellow-600">{stats.pendingStudents}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Outstanding Finance</CardTitle>
                  <DollarSign className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-red-600">${stats.financeOutstanding.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total outstanding</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Items Needing Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-orange-600 mb-2">{stats.itemsNeedingAttention}</div>
                  <p className="text-sm text-muted-foreground">
                    Items flagged for review or missing submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    New Textbooks Needed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-purple-600 mb-2">{stats.newTextbooksNeeded}</div>
                  <p className="text-sm text-muted-foreground">
                    Based on submission statistics and damage reports
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Clearance Progress by Category</CardTitle>
                <CardDescription>
                  Overall completion rates for each clearance requirement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clearanceProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Lookup Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Student Lookup
                </CardTitle>
                <CardDescription>
                  Search for students by name or student ID to view their clearance status
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
                                  {student.studentId} | Grade {student.grade} - {student.section}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">Progress:</span>
                                  <span className="text-sm font-medium">{getStudentProgressPercentage(student)}%</span>
                                </div>
                                <Progress value={getStudentProgressPercentage(student)} className="w-24 h-2" />
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
                                View Details
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Delays</CardTitle>
                  <CardDescription>
                    Which departments are causing the most delays
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentDelayData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="delays"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {departmentDelayData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Recommendations</CardTitle>
                  <CardDescription>
                    AI-generated insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h5 className="font-medium text-blue-900">Finance Department</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Consider implementing automated payment reminders to reduce the 40% pending finance clearances.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <h5 className="font-medium text-green-900">Textbook Management</h5>
                      <p className="text-sm text-green-700 mt-1">
                        Order 12 new textbooks based on damage reports and non-returns from this semester.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                      <h5 className="font-medium text-orange-900">Process Optimization</h5>
                      <p className="text-sm text-orange-700 mt-1">
                        Peak submission times are 10-11 AM. Consider additional staff during these hours.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
    </div>
  );
}