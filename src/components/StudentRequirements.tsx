import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { mockStudentRequirements } from '../data/mockData';
import { StudentRequirement } from '../types';
import { FileText, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';

interface StudentRequirementsProps {
  studentId: string;
}

export function StudentRequirements({ studentId }: StudentRequirementsProps) {
  const studentRequirements = mockStudentRequirements.filter(req => req.studentId === studentId);

  if (studentRequirements.length === 0) {
    return null;
  }

  const getStatusIcon = (status: StudentRequirement['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: StudentRequirement['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: StudentRequirement['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Teacher Requirements
        </CardTitle>
        <CardDescription>
          Additional requirements from your teachers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studentRequirements.map((requirement) => (
            <Card key={requirement.id} className={`border-l-4 ${getStatusColor(requirement.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(requirement.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{requirement.requirement}</h4>
                        <Badge className={getPriorityColor(requirement.priority)}>
                          {requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1)} Priority
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong>Teacher:</strong> {requirement.teacherName}
                        </p>
                        
                        {requirement.dueDate && (
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <strong>Due:</strong> {new Date(requirement.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        
                        {requirement.notes && (
                          <p>
                            <strong>Notes:</strong> {requirement.notes}
                          </p>
                        )}
                        
                        <p className="text-xs">
                          Created: {new Date(requirement.createdAt).toLocaleDateString()} at {new Date(requirement.createdAt).toLocaleTimeString()}
                        </p>
                        
                        {requirement.completedAt && (
                          <p className="text-xs text-green-600">
                            Completed: {new Date(requirement.completedAt).toLocaleDateString()} at {new Date(requirement.completedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={`${getStatusColor(requirement.status)} border ml-2`}>
                    {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}