import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth.tsx';
import { mockSignOutRequests } from '../data/mockData';
import { SignOutRequest } from '../types';
import { Users, Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';

export function AdminDashboard() {
  const { logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<SignOutRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // In a real app, this would be fetched from an API
  const pendingRequests = mockSignOutRequests.filter(req => req.status === 'pending');
  const allRequests = mockSignOutRequests;

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

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Request #${selectedRequest.id} approved successfully!`);
    setIsProcessing(false);
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Request #${selectedRequest.id} rejected.`);
    setIsProcessing(false);
    setSelectedRequest(null);
    setReviewNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1>Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage student clearance requests</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">In Progress</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {allRequests.filter(req => req.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">Clearance in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {allRequests.filter(req => req.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Fully cleared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Requests</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{allRequests.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>
              Review and approve student clearance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p>{request.student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Grade {request.student.grade} - {request.student.section}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{request.student.studentId}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{request.reason}</p>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Request #{request.id}</DialogTitle>
                              <DialogDescription>
                                Review the student's clearance request and make a decision
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Student Name</Label>
                                    <p>{selectedRequest.student.name}</p>
                                  </div>
                                  <div>
                                    <Label>Student ID</Label>
                                    <p>{selectedRequest.student.studentId}</p>
                                  </div>
                                  <div>
                                    <Label>Grade & Section</Label>
                                    <p>{selectedRequest.student.grade} - {selectedRequest.student.section}</p>
                                  </div>
                                  <div>
                                    <Label>Request Date</Label>
                                    <p>{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Reason for Sign-out</Label>
                                  <p className="mt-1 p-3 bg-muted rounded">{selectedRequest.reason}</p>
                                </div>

                                <div>
                                  <Label htmlFor="notes">Review Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Add any notes about your decision..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="outline"
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {isProcessing ? 'Processing...' : 'Reject'}
                                  </Button>
                                  <Button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isProcessing ? 'Processing...' : 'Approve'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* All Requests */}
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>
              View all student clearance requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p>{request.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.student.studentId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}