import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { useDataStore } from '../hooks/useDataStore.tsx';
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { StudentItemRegistration } from '../types';

interface StudentAssignedItemsProps {
  studentId: string;
}

export function StudentAssignedItems({ studentId }: StudentAssignedItemsProps) {
  const { studentItemRegistrations, updateStudentItemRegistration } = useDataStore();
  const [reportingItem, setReportingItem] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState({
    type: '' as 'missing' | 'damaged' | '',
    description: ''
  });

  // Get items assigned to this student
  const assignedItems = studentItemRegistrations.filter(item => item.studentId === studentId);

  const handleReportIssue = (itemId: string) => {
    if (!reportForm.type || !reportForm.description) {
      toast.error('Please fill in all fields');
      return;
    }

    const item = assignedItems.find(i => i.id === itemId);
    if (!item) return;

    updateStudentItemRegistration(itemId, {
      status: reportForm.type,
      reportedIssue: {
        type: reportForm.type,
        reportedAt: new Date().toISOString(),
        description: reportForm.description
      }
    });

    toast.success(`Issue reported to ${item.teacherName}`);
    setReportingItem(null);
    setReportForm({ type: '', description: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'returned':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'damaged':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const groupedItems = assignedItems.reduce((acc, item) => {
    const subject = item.subject || 'General';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(item);
    return acc;
  }, {} as Record<string, StudentItemRegistration[]>);

  if (assignedItems.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Assigned Items
        </CardTitle>
        <CardDescription>
          Items assigned to you by your teachers. Check off items when returned.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([subject, items]) => (
            <div key={subject}>
              <h4 className="font-medium mb-3">{subject}</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`${
                      item.status === 'returned' ? 'opacity-60 bg-muted' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`${item.status === 'returned' ? 'line-through' : 'font-medium'}`}>
                                {item.itemDescription}
                              </span>
                              <code className="px-2 py-0.5 bg-muted rounded text-xs">
                                {item.serialNumber}
                              </code>
                            </div>
                            
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <p>
                                <strong>Teacher:</strong> {item.teacherName}
                              </p>
                              <p>
                                <strong>Assigned:</strong> {new Date(item.registeredAt).toLocaleDateString()}
                              </p>
                              {item.returnedAt && (
                                <p className="text-green-600">
                                  <strong>Returned:</strong> {new Date(item.returnedAt).toLocaleDateString()}
                                  {item.condition && ` - Condition: ${item.condition}`}
                                </p>
                              )}
                              {item.reportedIssue && (
                                <p className="text-red-600">
                                  <strong>Reported Issue:</strong> {item.reportedIssue.type} - {item.reportedIssue.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Badge className={
                            item.status === 'returned' ? 'bg-green-100 text-green-800' :
                            item.status === 'missing' ? 'bg-red-100 text-red-800' :
                            item.status === 'damaged' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          
                          {item.status === 'assigned' && !item.reportedIssue && (
                            <Dialog open={reportingItem === item.id} onOpenChange={(open) => {
                              setReportingItem(open ? item.id : null);
                              if (!open) setReportForm({ type: '', description: '' });
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-xs"
                                >
                                  Report Issue
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Report Item Issue</DialogTitle>
                                  <DialogDescription>
                                    Report if this item is missing or damaged. Your teacher will be notified.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Item</Label>
                                    <p className="text-sm">{item.itemDescription} ({item.serialNumber})</p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="issueType">Issue Type *</Label>
                                    <Select
                                      value={reportForm.type}
                                      onValueChange={(value) => setReportForm({ ...reportForm, type: value as 'missing' | 'damaged' })}
                                    >
                                      <SelectTrigger id="issueType">
                                        <SelectValue placeholder="Select issue type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="missing">Missing</SelectItem>
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                      id="description"
                                      value={reportForm.description}
                                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                      placeholder="Please describe what happened..."
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setReportingItem(null);
                                      setReportForm({ type: '', description: '' });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={() => handleReportIssue(item.id)}>
                                    Submit Report
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
