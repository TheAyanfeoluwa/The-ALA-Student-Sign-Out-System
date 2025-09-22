import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth';
import { mockSignOutRequests, mockClearanceStations } from '../data/mockData';
import { SignOutRequest, ClearanceStation } from '../types';
import { Building2, Clock, CheckCircle, Eye, Stamp } from 'lucide-react';

export function StaffDashboard() {
  const { user, logout } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<SignOutRequest | null>(null);
  const [clearanceNotes, setClearanceNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get stations this user can access
  const userStations = mockClearanceStations.filter(station => 
    user?.stationAccess?.includes(station.id)
  );

  // Get requests that need clearance from this user's stations
  const pendingClearances = mockSignOutRequests.filter(request => 
    request.status === 'in_progress' &&
    request.clearanceProgress.some(progress => 
      userStations.some(station => station.id === progress.stationId) &&
      progress.status === 'pending'
    )
  );

  const getStationForUser = (): ClearanceStation | undefined => {
    return userStations[0]; // For demo, assume user manages one station
  };

  const handleClearanceApproval = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Clearance approved successfully!');
    setIsProcessing(false);
    setSelectedRequest(null);
    setClearanceNotes('');
  };

  const station = getStationForUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1>Clearance Station</h1>
                <p className="text-muted-foreground">
                  {station?.name} - {station?.department}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Station Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Station Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Station Name</p>
                <p>{station?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p>{station?.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff in Charge</p>
                <p>{station?.staffInCharge}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Clearances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stamp className="h-5 w-5" />
              Pending Clearances
            </CardTitle>
            <CardDescription>
              Students waiting for clearance from your station
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingClearances.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending clearances</p>
                <p className="text-sm text-muted-foreground">All students have been cleared</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingClearances.map((request) => {
                    const userStationProgress = request.clearanceProgress.find(progress => 
                      userStations.some(station => station.id === progress.stationId)
                    );
                    
                    return (
                      <TableRow key={request.id}>
                        <TableCell>#{request.id}</TableCell>
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
                                Process
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Process Clearance - {station?.name}</DialogTitle>
                                <DialogDescription>
                                  Review and approve clearance for {request.student.name}
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

                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="text-sm text-blue-900 mb-2">Clearance Requirements - {station?.name}</h4>
                                    <div className="text-xs text-blue-700 space-y-1">
                                      {station?.name === 'Library' && (
                                        <div>
                                          <p>• Check for outstanding book loans</p>
                                          <p>• Verify library card return</p>
                                          <p>• Confirm no pending fines</p>
                                        </div>
                                      )}
                                      {station?.name === 'Finance Office' && (
                                        <div>
                                          <p>• Verify tuition fees are paid</p>
                                          <p>• Check for outstanding balances</p>
                                          <p>• Confirm no pending payments</p>
                                        </div>
                                      )}
                                      {station?.name === 'Student Affairs' && (
                                        <div>
                                          <p>• Complete exit interview</p>
                                          <p>• Return student ID card</p>
                                          <p>• Update contact information</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="clearance-notes">Clearance Notes</Label>
                                    <Textarea
                                      id="clearance-notes"
                                      placeholder="Add any notes about the clearance process..."
                                      value={clearanceNotes}
                                      onChange={(e) => setClearanceNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex justify-end">
                                    <Button
                                      onClick={handleClearanceApproval}
                                      disabled={isProcessing}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {isProcessing ? 'Processing...' : 'Approve Clearance'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingClearances.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting clearance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Processed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">5</div>
              <p className="text-xs text-muted-foreground">Clearances approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total This Month</CardTitle>
              <Stamp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">28</div>
              <p className="text-xs text-muted-foreground">Students processed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}