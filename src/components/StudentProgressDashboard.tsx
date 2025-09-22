import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../hooks/useAuth.tsx';
import { mockClearanceItems } from '../data/mockData';
import { ClearanceItem, ClearanceStatus } from '../types';
import { CheckCircle, Clock, AlertTriangle, Download, QrCode, DollarSign, User, Mail, Calendar } from 'lucide-react';
import { ClearanceReceipt } from './ClearanceReceipt';
import { StudentRequirements } from './StudentRequirements';
import alaLogo from 'figma:asset/98c862684db16b3b8a0d3e90ef2456b6acca8f4e.png';

export function StudentProgressDashboard() {
  const { user, logout } = useAuth();
  const [showReceipt, setShowReceipt] = useState(false);
  
  const student = user?.studentInfo;
  if (!student) return null;

  const getItemStatus = (itemId: string): ClearanceStatus | undefined => {
    return student.clearanceItems.find(item => item.itemId === itemId);
  };

  const getStatusIcon = (status: ClearanceStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'action_required':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: ClearanceStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'action_required':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: ClearanceStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'action_required':
        return 'Action Required';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const calculateProgress = () => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = requiredItems.filter(item => {
      const status = getItemStatus(item.id);
      return status?.status === 'completed';
    });
    return Math.round((completedItems.length / requiredItems.length) * 100);
  };

  const allRequiredItemsCompleted = () => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    return requiredItems.every(item => {
      const status = getItemStatus(item.id);
      return status?.status === 'completed';
    });
  };

  const outstandingFinanceAmount = () => {
    const financeStatus = getItemStatus('7'); // Finance clearance
    return financeStatus?.outstandingAmount || 0;
  };

  const getApprovalProgress = () => {
    const approvals = [
      student.approvalStatus.stationStaffApproval,
      student.approvalStatus.teacherApproval,
      student.approvalStatus.hallHeadApproval,
      student.approvalStatus.advisorApproval,
      student.approvalStatus.yearHeadApproval
    ];
    const completed = approvals.filter(Boolean).length;
    return { completed, total: approvals.length };
  };

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
                <p className="text-muted-foreground">Student Clearance Dashboard - Track your clearance progress</p>
              </div>
            </div>
            <Button variant="maroon" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info */}
        <Card className="mb-6">
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
                <p>{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p>{student.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p>{student.grade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Advisor</p>
                <p>{student.advisor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year Head</p>
                <p>{student.yearHead}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Clearance Progress</span>
              {student.finalClearanceStatus === 'completed' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Progress</span>
                  <span>{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-3" />
              </div>
              
              {student.finalClearanceStatus === 'completed' ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    <strong>Congratulations!</strong> Your clearance is complete. 
                    <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="h-auto p-0 ml-1 text-green-800">
                          View your clearance receipt.
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <ClearanceReceipt student={student} />
                      </DialogContent>
                    </Dialog>
                  </AlertDescription>
                </Alert>
              ) : allRequiredItemsCompleted() ? (
                <Alert className="bg-secondary border-border">
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-primary">
                    All requirements completed! Awaiting final approval from your Year Head.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Complete all required items below to proceed with final clearance.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Finance Alert */}
        {outstandingFinanceAmount() > 0 && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <DollarSign className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <strong>Outstanding Balance: ${outstandingFinanceAmount().toFixed(2)}</strong>
              <br />
              Please pay your outstanding balance to complete finance clearance.
            </AlertDescription>
          </Alert>
        )}

        {/* Teacher Requirements */}
        <StudentRequirements studentId={student.id} />

        {/* Approval Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
            <CardDescription>
              Progress through the approval stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Approvals Progress</span>
                  <span>{getApprovalProgress().completed}/{getApprovalProgress().total}</span>
                </div>
                <Progress value={(getApprovalProgress().completed / getApprovalProgress().total) * 100} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-2">
                  {student.approvalStatus.stationStaffApproval ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Reception</span>
                </div>
                <div className="flex items-center gap-2">
                  {student.approvalStatus.teacherApproval ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Teacher</span>
                </div>
                <div className="flex items-center gap-2">
                  {student.approvalStatus.hallHeadApproval ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Hall Head</span>
                </div>
                <div className="flex items-center gap-2">
                  {student.approvalStatus.advisorApproval ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Advisor</span>
                </div>
                <div className="flex items-center gap-2">
                  {student.approvalStatus.yearHeadApproval ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">Year Head</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-by-subject Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subject-by-subject Requirements</CardTitle>
            <CardDescription>
              Return all academic materials for each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockClearanceItems
                .filter(item => item.category === 'subject_materials')
                .map((item) => {
                  const status = getItemStatus(item.id) || { itemId: item.id, studentId: student.id, status: 'pending' as const };
                  
                  return (
                    <Card key={item.id} className={`border-l-4 ${getStatusColor(status.status)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(status.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4>{item.name}</h4>
                                {item.isRequired && (
                                  <Badge variant="secondary" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.description}
                              </p>
                              
                              {item.requiresSubmission && status.status === 'pending' && (
                                <p className="text-sm text-blue-600">
                                  📍 Submit at: Library Counter
                                </p>
                              )}
                              
                              {status.status === 'completed' && status.completedBy && (
                                <div className="text-sm text-green-600">
                                  <p>✓ Completed by {status.completedBy}</p>
                                  {status.completedAt && (
                                    <p className="flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(status.completedAt).toLocaleDateString()} at {new Date(status.completedAt).toLocaleTimeString()}
                                    </p>
                                  )}
                                  {status.notes && (
                                    <p className="mt-1 italic">"{status.notes}"</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Badge className={`${getStatusColor(status.status)} border`}>
                            {getStatusText(status.status)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Other Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Other Requirements</CardTitle>
            <CardDescription>
              Additional items and clearances required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {mockClearanceItems
                .filter(item => item.category === 'other_requirements' || item.category === 'finance')
                .map((item) => {
                  const status = getItemStatus(item.id) || { itemId: item.id, studentId: student.id, status: 'pending' as const };
                  
                  return (
                    <Card key={item.id} className={`border-l-4 ${getStatusColor(status.status)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(status.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4>{item.name}</h4>
                                {item.isRequired && (
                                  <Badge variant="secondary" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.description}
                              </p>
                              
                              {item.requiresSubmission && status.status === 'pending' && (
                                <p className="text-sm text-blue-600">
                                  📍 Submit at: Reception
                                </p>
                              )}
                              
                              {status.status === 'action_required' && status.outstandingAmount && (
                                <p className="text-sm text-red-600">
                                  Outstanding amount: ${status.outstandingAmount.toFixed(2)}
                                </p>
                              )}
                              
                              {status.status === 'completed' && status.completedBy && (
                                <div className="text-sm text-green-600">
                                  <p>✓ Completed by {status.completedBy}</p>
                                  {status.completedAt && (
                                    <p className="flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(status.completedAt).toLocaleDateString()} at {new Date(status.completedAt).toLocaleTimeString()}
                                    </p>
                                  )}
                                  {status.notes && (
                                    <p className="mt-1 italic">"{status.notes}"</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Badge className={`${getStatusColor(status.status)} border`}>
                            {getStatusText(status.status)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.href = 'mailto:CDelight@africanleadershipacademy.org'}
              >
                <Mail className="h-4 w-4" />
                Contact Advisor
              </Button>

              {student.finalClearanceStatus === 'completed' && (
                <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <ClearanceReceipt student={student} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}