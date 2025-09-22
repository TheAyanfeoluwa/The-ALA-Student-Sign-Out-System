import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../hooks/useAuth.tsx';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import alaLogo from 'figma:asset/98c862684db16b3b8a0d3e90ef2456b6acca8f4e.png';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={alaLogo} 
              alt="African Leadership Academy Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <CardTitle>African Leadership Academy</CardTitle>
          <CardDescription>
            Student Clearance System - Sign in to manage your clearance process
          </CardDescription>
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" variant="default" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}