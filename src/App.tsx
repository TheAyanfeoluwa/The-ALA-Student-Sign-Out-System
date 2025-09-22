import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { LoginForm } from './components/LoginForm';
import { StudentProgressDashboard } from './components/StudentProgressDashboard';
import { SimplifiedAdminDashboard } from './components/SimplifiedAdminDashboard';
import { StationStaffInterface } from './components/StationStaffInterface';
import { ApprovalDashboard } from './components/ApprovalDashboard';
import { YearHeadDashboard } from './components/YearHeadDashboard';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Tablet } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [showKiosk, setShowKiosk] = useState(false);

  if (!user) {
    return <LoginForm />;
  }

  // Kiosk mode - only available for station staff
  if (showKiosk && user.role === 'station_staff') {
    return (
      <div>
        <div className="absolute top-4 right-4 z-10">
         
        </div>
        <StationStaffInterface />
      </div>
    );
  }

  switch (user.role) {
    case 'student':
      return <StudentProgressDashboard />;
    case 'admin':
      return <SimplifiedAdminDashboard />;
    case 'station_staff':
      return (
        <div>
          <div className="absolute top-4 right-4 z-10">
            
          </div>
          <StationStaffInterface />
        </div>
      );
    case 'teacher':
    case 'hall_head':
    case 'advisor':
      return <ApprovalDashboard />;
    case 'year_head':
      return <YearHeadDashboard />;
    default:
      return <LoginForm />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}