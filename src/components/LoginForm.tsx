import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useAuth } from '../hooks/useAuth.tsx';
import { useDataStore } from '../hooks/useDataStore.tsx';
import { validateAndSanitize, trackLoginAttempt, resetLoginAttempts } from '../utils/inputSanitization';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Shield, AlertTriangle, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [resetTime, setResetTime] = useState<number | null>(null);
  const [showUnlockRequestDialog, setShowUnlockRequestDialog] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const { login, isLoading } = useAuth();
  const { users, lockUser, addUnlockRequest } = useDataStore();

  // Countdown timer for rate limit
  useEffect(() => {
    if (resetTime && resetTime > 0) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((resetTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setIsRateLimited(false);
          setResetTime(null);
          setAttemptsRemaining(5);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resetTime]);

  const handleRequestUnlock = () => {
    if (!unlockReason.trim()) {
      toast.error('Please provide a reason for unlock request');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;

    const request = {
      id: `unlock-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      lockedAt: user.lockedUntil || new Date().toISOString(),
      attemptCount: user.loginAttempts || 5,
      requestedAt: new Date().toISOString(),
      status: 'pending' as const,
      notes: unlockReason
    };

    addUnlockRequest(request);
    toast.success('Unlock request submitted to admin. You will be notified once approved.');
    setShowUnlockRequestDialog(false);
    setUnlockReason('');
  };

  const handleForgotPassword = () => {
    if (!forgotPasswordEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailValidation = validateAndSanitize(forgotPasswordEmail, 'email');
    if (!emailValidation.isValid) {
      toast.error('Please enter a valid email address');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === emailValidation.sanitized.toLowerCase());
    if (!user) {
      // For security, don't reveal if email exists
      toast.success('If an account exists with this email, a password reset link has been sent.');
      setShowForgotPasswordDialog(false);
      setForgotPasswordEmail('');
      return;
    }

    // In a real application, this would send an email. For demo purposes, we show the password
    toast.success(`Password reset email sent to ${user.email}. For demo purposes, your password is: ${user.password || 'password'}`);
    setShowForgotPasswordDialog(false);
    setForgotPasswordEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation and sanitization
    const emailValidation = validateAndSanitize(email, 'email');
    const passwordValidation = validateAndSanitize(password, 'password');

    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }

    // Check if user is locked
    const user = users.find(u => u.email.toLowerCase() === emailValidation.sanitized.toLowerCase());
    if (user?.isLocked) {
      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;
      const now = new Date();
      
      // Check if lock timer has expired or if user was unlocked by admin
      if (!lockedUntil || lockedUntil <= now) {
        // Auto-unlock if time has passed or admin cleared the timer
        lockUser(user.id, '', 0);
        resetLoginAttempts(emailValidation.sanitized);
        setAttemptsRemaining(5);
      } else if (lockedUntil > now) {
        const minutesRemaining = Math.ceil((lockedUntil.getTime() - now.getTime()) / 60000);
        setError(`Account is locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes or request an admin unlock.`);
        setShowUnlockRequestDialog(true);
        return;
      }
    }

    // Track login attempts for rate limiting
    const attemptTracking = trackLoginAttempt(emailValidation.sanitized);
    
    if (!attemptTracking.allowed) {
      setIsRateLimited(true);
      if (attemptTracking.resetIn) {
        setResetTime(Date.now() + attemptTracking.resetIn);
        const minutes = Math.ceil(attemptTracking.resetIn / 60000);
        setError(`Too many login attempts. Please try again in ${minutes} minutes.`);
      }
      
      // Lock the account after 5 failed attempts
      if (user) {
        lockUser(user.id, 'Multiple failed login attempts', 5);
        toast.error('Account locked due to multiple failed login attempts');
        setShowUnlockRequestDialog(true);
      }
      
      return;
    }

    setAttemptsRemaining(attemptTracking.attemptsRemaining);

    // Attempt login with current users from DataStore
    const success = await login(emailValidation.sanitized, passwordValidation.sanitized, users);
    
    if (!success) {
      setError(`Invalid email or password. ${attemptTracking.attemptsRemaining} attempts remaining.`);
      
      // Show warning when approaching limit
      if (attemptTracking.attemptsRemaining <= 2) {
        toast.error(`Warning: Only ${attemptTracking.attemptsRemaining} attempts remaining before account lockout`);
      }
      
      if (attemptTracking.attemptsRemaining === 0) {
        if (user) {
          lockUser(user.id, 'Multiple failed login attempts', 5);
        }
        setError('Account locked due to multiple failed login attempts. Please request an admin unlock.');
        setShowUnlockRequestDialog(true);
      }
    } else {
      // Reset on successful login
      resetLoginAttempts(emailValidation.sanitized);
      setAttemptsRemaining(5);
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ImageWithFallback 
              src="https://www.africanleadershipacademy.org/wp-content/uploads/2018/07/Aplicar-Etapa-1.png" 
              alt="African Leadership Academy Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <CardTitle>African Leadership Academy</CardTitle>
          <CardDescription>
            Student Clearance System - Sign in to manage your clearance process
          </CardDescription>
          
          {/* Security Indicators */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secured with Brute-force Protection & Input Sanitization</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isRateLimited}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isRateLimited}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Attempts Remaining Indicator */}
            {attemptsRemaining < 5 && attemptsRemaining > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {attemptsRemaining} login attempts remaining before account lockout
                </AlertDescription>
              </Alert>
            )}

            {/* Rate Limit Countdown */}
            {isRateLimited && resetTime && (
              <Alert variant="destructive">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Too many attempts. Try again in {formatTime(resetTime - Date.now())}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="default" 
              className="w-full" 
              disabled={isLoading || isRateLimited}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPasswordDialog(true)}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Demo accounts:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Student:</strong> aayanlade24@alastudents.org</p>
              <p><strong>Admin:</strong> admin@africanleadershipacademy.org</p>
              <p><strong>Reception Staff:</strong> reception@africanleadershipacademy.org</p>
              <p><strong>Teacher:</strong> IAdeleke@africanleadershipacademy.org</p>
              <p><strong>Hall Head:</strong> brown@africanleadershipacademy.org</p>
              <p><strong>Advisor:</strong> CDelight@africanleadershipacademy.org</p>
              <p><strong>Year Head:</strong> SThulo@africanleadershipacademy.org</p>
              <p><strong>Password:</strong> password (for all accounts)</p>
            </div>
          </div>

          {/* Security Features Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-2">Security Features:</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✓ Input sanitization (XSS & SQL injection protection)</li>
              <li>✓ Brute-force protection with rate limiting</li>
              <li>✓ Account lockout after 5 failed attempts</li>
              <li>✓ 30-minute automatic unlock or admin approval</li>
              <li>✓ Real-time attempt tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="forgotEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                For demo purposes, the password will be shown in the notification. In production, a secure reset link would be sent to your email.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowForgotPasswordDialog(false);
              setForgotPasswordEmail('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleForgotPassword}>
              Send Reset Instructions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Request Dialog */}
      <Dialog open={showUnlockRequestDialog} onOpenChange={setShowUnlockRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Locked - Request Unlock</DialogTitle>
            <DialogDescription>
              Your account has been locked due to multiple failed login attempts. You can request an admin to unlock your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your account will automatically unlock after 30 minutes, or you can request immediate admin approval.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="unlockReason">Reason for unlock request</Label>
              <Textarea
                id="unlockReason"
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Please explain why you need immediate access..."
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestUnlock}>
              Submit Unlock Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
