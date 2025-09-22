import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Student } from '../types';
import { mockClearanceItems } from '../data/mockData';
import { Download, CheckCircle, Calendar, User, Mail, QrCode } from 'lucide-react';

interface ClearanceReceiptProps {
  student: Student;
}

export function ClearanceReceipt({ student }: ClearanceReceiptProps) {
  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    const element = document.getElementById('clearance-receipt');
    if (element) {
      window.print();
    }
  };

  const handleEmailReceipt = () => {
    // In a real app, this would trigger an email
    alert('Clearance receipt has been sent to your email address.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Clearance Receipt</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEmailReceipt}>
            <Mail className="h-4 w-4 mr-2" />
            Email Receipt
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div id="clearance-receipt" className="bg-white">
        <Card>
          <CardHeader className="text-center border-b">
            <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Clearance Complete
            </CardTitle>
            <p className="text-muted-foreground">
              This certifies that the student has completed all clearance requirements
            </p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-medium mb-3">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p>{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p>{student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade & Section</p>
                  <p>{student.grade} - {student.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{student.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Confirmation Details */}
            <div>
              <h3 className="text-lg font-medium mb-3">Confirmation Details</h3>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmation Code</p>
                  <p className="text-xl font-mono">{student.confirmationCode}</p>
                </div>
                <div className="flex items-center gap-4">
                  <QrCode className="h-16 w-16 text-gray-400" />
                  <div className="text-xs text-muted-foreground">
                    QR Code for<br />verification
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Final Approved By</p>
                  <p>{student.finalApprovedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approval Date</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {student.finalApprovedAt && new Date(student.finalApprovedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Completed Items */}
            <div>
              <h3 className="text-lg font-medium mb-3">Completed Requirements</h3>
              <div className="space-y-3">
                {mockClearanceItems
                  .filter(item => item.isRequired)
                  .map(item => {
                    const status = student.clearanceItems.find(s => s.itemId === item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p>{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-green-600">Completed</p>
                          {status?.completedBy && (
                            <p className="text-muted-foreground">by {status.completedBy}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <Separator />

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This is an official clearance document generated by the Student Clearance System
              </p>
              <p className="text-xs text-muted-foreground">
                Generated on {new Date().toLocaleString()}
              </p>
              <div className="flex justify-center items-center gap-2 mt-4">
                <div className="w-20 h-1 bg-blue-600"></div>
                <span className="text-xs text-muted-foreground">OFFICIAL SEAL</span>
                <div className="w-20 h-1 bg-blue-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}