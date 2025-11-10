import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { useDataStore } from '../hooks/useDataStore';
import { User } from '../types';
import { UserPlus, GraduationCap, Building, UserCheck, Crown } from 'lucide-react';

interface StaffRegistrationFormProps {
  open: boolean;
  onClose: () => void;
}

export function StaffRegistrationForm({ open, onClose }: StaffRegistrationFormProps) {
  const { addUser, students } = useDataStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    managedHalls: [] as string[],
    advisees: [] as string[],
    teacherClasses: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableHalls = [...new Set(students.map(s => s.hall).filter(Boolean))];
  const availableStudents = students.map(s => ({ id: s.id, name: s.name, studentId: s.studentId }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@africanleadershipacademy.org')) {
      newErrors.email = 'Email must use @africanleadershipacademy.org domain';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.role === 'hall_head' && formData.managedHalls.length === 0) {
      newErrors.managedHalls = 'Hall Head must manage at least one hall';
    }

    if (formData.role === 'advisor' && formData.advisees.length === 0) {
      newErrors.advisees = 'Advisor must have at least one advisee';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role as 'teacher' | 'hall_head' | 'advisor' | 'year_head',
      ...(formData.role === 'hall_head' && { managedHalls: formData.managedHalls }),
      ...(formData.role === 'advisor' && { advisees: formData.advisees }),
      ...(formData.role === 'teacher' && { teacherClasses: formData.teacherClasses })
    };

    addUser(newUser);

    toast.success(`${getRoleDisplayName(formData.role)} account created successfully!`, {
      description: `${formData.name} can now access the system`
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      role: '',
      managedHalls: [],
      advisees: [],
      teacherClasses: []
    });
    setErrors({});
    onClose();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'teacher': return 'Teacher';
      case 'hall_head': return 'Hall Head';
      case 'advisor': return 'Advisor';
      case 'year_head': return 'Year Head';
      default: return 'Staff';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return <GraduationCap className="h-5 w-5" />;
      case 'hall_head': return <Building className="h-5 w-5" />;
      case 'advisor': return <UserCheck className="h-5 w-5" />;
      case 'year_head': return <Crown className="h-5 w-5" />;
      default: return <UserPlus className="h-5 w-5" />;
    }
  };

  const handleHallToggle = (hall: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        managedHalls: [...prev.managedHalls, hall]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        managedHalls: prev.managedHalls.filter(h => h !== hall)
      }));
    }
  };

  const handleAdviseeToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        advisees: [...prev.advisees, studentId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        advisees: prev.advisees.filter(id => id !== studentId)
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Register New Staff Member
          </DialogTitle>
          <DialogDescription>
            Create a new account for teaching and administrative staff
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="name@africanleadershipacademy.org"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                role: value,
                managedHalls: [],
                advisees: [],
                teacherClasses: []
              }))}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select staff role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Teacher
                  </div>
                </SelectItem>
                <SelectItem value="hall_head">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Hall Head
                  </div>
                </SelectItem>
                <SelectItem value="advisor">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Advisor
                  </div>
                </SelectItem>
                <SelectItem value="year_head">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Year Head
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
          </div>

          {/* Role-specific Configuration */}
          {formData.role === 'hall_head' && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-base font-medium">Managed Halls *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select which halls this Hall Head will manage
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {availableHalls.map(hall => (
                    <div key={hall} className="flex items-center space-x-2">
                      <Checkbox
                        id={`hall-${hall}`}
                        checked={formData.managedHalls.includes(hall)}
                        onCheckedChange={(checked) => handleHallToggle(hall, checked as boolean)}
                      />
                      <Label htmlFor={`hall-${hall}`} className="text-sm cursor-pointer">
                        {hall}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.managedHalls && <p className="text-sm text-red-600 mt-2">{errors.managedHalls}</p>}
              </CardContent>
            </Card>
          )}

          {formData.role === 'advisor' && (
            <Card>
              <CardContent className="p-4">
                <Label className="text-base font-medium">Advisees *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select students this advisor will support
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {availableStudents.map(student => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={formData.advisees.includes(student.id)}
                        onCheckedChange={(checked) => handleAdviseeToggle(student.id, checked as boolean)}
                      />
                      <Label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                        {student.name} ({student.studentId})
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.advisees && <p className="text-sm text-red-600 mt-2">{errors.advisees}</p>}
              </CardContent>
            </Card>
          )}

          {/* Role Description */}
          {formData.role && (
            <Card className="bg-muted">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getRoleIcon(formData.role)}
                  <div>
                    <h4 className="font-medium">{getRoleDisplayName(formData.role)} Responsibilities</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.role === 'teacher' && 'Approve student clearances and manage class requirements'}
                      {formData.role === 'hall_head' && 'Manage hall clearances and approve students in assigned halls'}
                      {formData.role === 'advisor' && 'Guide students through clearance process and provide approval'}
                      {formData.role === 'year_head' && 'Oversee year-level clearances and final approvals'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Create Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}