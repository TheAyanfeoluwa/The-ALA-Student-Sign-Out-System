import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useDataStore } from '../hooks/useDataStore.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { AdminUnlockRequest } from '../types';
import { Shield, Unlock, X, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { resetLoginAttempts } from '../utils/inputSanitization';

export function AdminUnlockRequests() {
  const { unlockRequests, updateUnlockRequest, unlockUser, users } = useDataStore();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<AdminUnlockRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const pendingRequests = unlockRequests.filter(req => req.status === 'pending');
  const processedRequests = unlockRequests.filter(req => req.status !== 'pending');

  const handleApproveUnlock = () => {
    if (!selectedRequest || !user) return;

    // Unlock the user
    unlockUser(selectedRequest.userId);
    
    // Reset login attempts tracking
    resetLoginAttempts(selectedRequest.userEmail);

    // Update the request
    updateUnlockRequest(selectedRequest.id, {
      status: 'approved',
      approvedBy: user.name,
      approvedAt: new Date().toISOString(),
      notes: adminNotes || 'Account unlocked by admin'
    });

    toast.success(`Account unlocked for ${selectedRequest.userName}`);
    setShowDialog(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const handleRejectUnlock = () => {
    if (!selectedRequest || !user) return;

    updateUnlockRequest(selectedRequest.id, {
      status: 'rejected',
      approvedBy: user.name,
      approvedAt: new Date().toISOString(),
      notes: adminNotes || 'Unlock request rejected'
    });

    toast.error(`Unlock request rejected for ${selectedRequest.userName}`);
    setShowDialog(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const openDialog = (request: AdminUnlockRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setShowDialog(true);
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Pending Unlock Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pending Unlock Requests
            {pendingRequests.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {pendingRequests.length} Pending
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve account unlock requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending unlock requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Locked At</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => {
                  const lockedUser = users.find(u => u.id === request.userId);
                  const autoUnlockTime = lockedUser?.lockedUntil ? new Date(lockedUser.lockedUntil) : null;
                  const now = new Date();
                  const canAutoUnlock = autoUnlockTime && autoUnlockTime > now;

                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.userName}</div>
                          {canAutoUnlock && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              Auto-unlock in {Math.ceil((autoUnlockTime.getTime() - now.getTime()) / 60000)} min
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{request.userEmail}</TableCell>
                      <TableCell className="text-sm">
                        {getTimeSince(request.lockedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {request.attemptCount} attempts
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate" title={request.notes}>
                          {request.notes || 'No reason provided'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => openDialog(request, 'approve')}
                          >
                            <Unlock className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(request, 'reject')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests History */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Request History
            </CardTitle>
            <CardDescription>
              Previously processed unlock requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.slice(0, 10).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.userName}</div>
                        <div className="text-xs text-muted-foreground">{request.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        request.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {request.status === 'approved' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Rejected
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{request.approvedBy}</TableCell>
                    <TableCell className="text-sm">
                      {request.approvedAt ? getTimeSince(request.approvedAt) : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate" title={request.notes}>
                        {request.notes || '-'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Unlock Request' : 'Reject Unlock Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This will immediately unlock the user account and reset their login attempts.'
                : 'The user will need to wait for the automatic unlock timer or submit a new request.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>User:</strong> {selectedRequest.userName} ({selectedRequest.userEmail})<br />
                  <strong>Failed Attempts:</strong> {selectedRequest.attemptCount}<br />
                  <strong>User's Reason:</strong> {selectedRequest.notes || 'No reason provided'}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDialog(false);
              setAdminNotes('');
            }}>
              Cancel
            </Button>
            {actionType === 'approve' ? (
              <Button onClick={handleApproveUnlock} className="bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Approve & Unlock
              </Button>
            ) : (
              <Button onClick={handleRejectUnlock} variant="destructive">
                <X className="h-4 w-4 mr-2" />
                Reject Request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
