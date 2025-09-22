import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SignOutRequestFormProps {
  onClose: () => void;
}

export function SignOutRequestForm({ onClose }: SignOutRequestFormProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [requestType, setRequestType] = useState<'permanent' | 'temporary'>('permanent');
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would send the request to an API
    toast.success('Clearance request submitted successfully!', {
      description: 'You will be notified when your request is reviewed.'
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Sign-out</Label>
        <Textarea
          id="reason"
          placeholder="Please provide a detailed reason for your sign-out request..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={4}
        />
      </div>

      <div className="space-y-3">
        <Label>Request Type</Label>
        <RadioGroup value={requestType} onValueChange={(value) => setRequestType(value as 'permanent' | 'temporary')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="permanent" id="permanent" />
            <Label htmlFor="permanent">Permanent (Transfer/Withdrawal)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="temporary" id="temporary" />
            <Label htmlFor="temporary">Temporary (Leave of Absence)</Label>
          </div>
        </RadioGroup>
      </div>

      {requestType === 'temporary' && (
        <div className="space-y-2">
          <Label>Expected Return Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expectedReturnDate ? format(expectedReturnDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={expectedReturnDate}
                onSelect={setExpectedReturnDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm text-blue-900 mb-2">Required Clearances</h4>
        <p className="text-xs text-blue-700 mb-2">
          Your request will need approval from the following departments:
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Library (Return all borrowed books)</li>
          <li>• Finance Office (Settle all financial obligations)</li>
          <li>• Student Affairs (Complete exit procedures)</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !reason.trim()}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
}