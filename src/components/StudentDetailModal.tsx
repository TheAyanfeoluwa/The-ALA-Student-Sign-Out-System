import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Student } from '../types';
import { mockClearanceItems } from '../data/mockData';
import { CheckCircle, Clock, AlertTriangle, User, Mail, Calendar, Phone } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  open: boolean;
  onClose: () => void;
}

export function StudentDetailModal({ student, open, onClose }: StudentDetailModalProps) {
  const getItemStatus = (itemId: string) => {
    return student.clearanceItems.find(item => item.itemId === itemId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'action_required':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'action_required':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateProgress = () => {
    const requiredItems = mockClearanceItems.filter(item => item.isRequired);
    const completedItems = student.clearanceItems.filter(item => 
      item.status === 'completed' && requiredItems.some(req => req.id === item.itemId)
    );
    return Math.round((completedItems.length / requiredItems.length) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Clearance Details
          </DialogTitle>
          <DialogDescription>
            Complete clearance overview for {student.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade & Section</p>
                  <p className="font-medium">{student.grade} - {student.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Advisor</p>
                  <p className="font-medium">{student.advisor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year Head</p>
                  <p className="font-medium">{student.yearHead}</p>
                </div>
                {student.hall && (
                  <div>
                    <p className="text-sm text-muted-foreground">Hall</p>
                    <p className="font-medium">{student.hall}</p>
                  </div>
                )}
                {student.outstandingBalance && student.outstandingBalance > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                    <p className="font-medium text-red-600">${student.outstandingBalance.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Clearance Progress</span>
                <Badge className={
                  student.finalClearanceStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }>
                  {student.finalClearanceStatus === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Overall Progress</span>
                    <span className="font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-3" />
                </div>
                
                {student.finalClearanceStatus === 'completed' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Final Clearance Complete</span>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Approved by: {student.finalApprovedBy}</p>
                      {student.finalApprovedAt && (
                        <p className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(student.finalApprovedAt).toLocaleString()}
                        </p>
                      )}
                      {student.confirmationCode && (
                        <p className="font-mono mt-1">Confirmation: {student.confirmationCode}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Clearance Items */}
          <Card>
            <CardHeader>
              <CardTitle>Clearance Items Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClearanceItems.map((item) => {
                  const status = getItemStatus(item.id) || { 
                    itemId: item.id, 
                    studentId: student.id, 
                    status: 'pending' as const 
                  };
                  
                  return (
                    <Card key={item.id} className="border-l-4 border-l-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(status.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">{item.name}</h5>
                                {item.isRequired && (
                                  <Badge variant="secondary" className="text-xs">Required</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.description}
                              </p>
                              
                              {item.requiresSubmission && (
                                <p className="text-xs text-blue-600 mb-2">
                                  📍 Requires physical submission
                                </p>
                              )}
                              
                              {status.status === 'action_required' && status.outstandingAmount && (
                                <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                                  Outstanding: ${status.outstandingAmount.toFixed(2)}
                                </div>
                              )}
                              
                              {status.status === 'completed' && (
                                <div className="bg-green-50 p-2 rounded text-sm">
                                  <p className="text-green-700">
                                    ✓ Completed by {status.completedBy}
                                  </p>
                                  {status.completedAt && (
                                    <p className="text-green-600 flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(status.completedAt).toLocaleString()}
                                    </p>
                                  )}
                                  {status.notes && (
                                    <p className="text-green-600 mt-1 italic">
                                      "{status.notes}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Badge className={getStatusColor(status.status)}>
                            {status.status === 'completed' ? 'Completed' :
                             status.status === 'action_required' ? 'Action Required' : 'Pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <a href={`mailto:${student.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email Student
              </a>
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}