import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../hooks/useAuth';
import { mockSignOutRequests, mockClearanceStations } from '../data/mockData';
import { SignOutRequest } from '../types';
import { Plus, Clock, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import { SignOutRequestForm } from './SignOutRequestForm';

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // In a real app, this would be fetched from an API
  const studentRequests = mockSignOutRequests.filter(req => req.studentId === user?.studentInfo?.id);

  const getStatusColor = (status: SignOutRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: SignOutRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (request: SignOutRequest) => {
    if (request.status === 'pending') return 0;
    if (request.status === 'rejected') return 0;
    if (request.status === 'completed') return 100;
    
    const requiredStations = mockClearanceStations.filter(station => station.isRequired);
    const approvedStations = request.clearanceProgress.filter(progress => 
      progress.status === 'approved' && requiredStations.some(station => station.id === progress.stationId)
    );
    
    const adminApproved = request.adminApproval ? 1 : 0;
    const totalSteps = requiredStations.length + 1; // +1 for admin approval
    const completedSteps = approvedStations.length + adminApproved;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1>Student Clearance Portal</h1>
                <p className="text-muted-foreground">Welcome, {user?.studentInfo?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p>{user?.studentInfo?.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grade & Section</p>
                <p>{user?.studentInfo?.grade} - {user?.studentInfo?.section}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{user?.studentInfo?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2>My Clearance Requests</h2>
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Clearance Request</DialogTitle>
                <DialogDescription>
                  Fill out the form below to start your clearance process
                </DialogDescription>
              </DialogHeader>
              <SignOutRequestForm onClose={() => setShowRequestForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {studentRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No clearance requests yet</p>
                <p className="text-sm text-muted-foreground">Click "New Request" to get started</p>
              </CardContent>
            </Card>
          ) : (
            studentRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        Request #{request.id}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.requestDate).toLocaleDateString()}
                        </span>
                        {request.expectedReturnDate && (
                          <span>Expected return: {new Date(request.expectedReturnDate).toLocaleDateString()}</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p>{request.reason}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <span className="text-sm">{calculateProgress(request)}%</span>
                      </div>
                      <Progress value={calculateProgress(request)} className="h-2" />
                    </div>

                    {request.status !== 'pending' && request.status !== 'rejected' && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Clearance Status</p>
                        <div className="space-y-2">
                          {/* Admin Approval */}
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                                {request.adminApproval ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                              <span>Admin Approval</span>
                            </div>
                            <Badge variant={request.adminApproval ? "default" : "secondary"}>
                              {request.adminApproval ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>

                          {/* Clearance Stations */}
                          {mockClearanceStations.filter(station => station.isRequired).map((station) => {
                            const progress = request.clearanceProgress.find(p => p.stationId === station.id);
                            return (
                              <div key={station.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                                    {progress?.status === 'approved' ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-yellow-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p>{station.name}</p>
                                    <p className="text-xs text-muted-foreground">{station.staffInCharge}</p>
                                  </div>
                                </div>
                                <Badge variant={progress?.status === 'approved' ? "default" : "secondary"}>
                                  {progress?.status === 'approved' ? 'Cleared' : 'Pending'}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}