import { useState } from 'react';
import { TransportDashboard } from 'components/TransportDashboard';
import { RouteDetail } from 'components/RouteDetail';
import { StudentProfile } from 'components/StudentProfile';
import { TransportSchedule } from 'components/TransportSchedule';

import './global.css';

type Screen = 'dashboard' | 'routeDetail' | 'profile' | 'schedule';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <TransportDashboard 
            studentName="João Silva"
            onRouteSelect={() => setCurrentScreen('routeDetail')}
            onProfileSelect={() => setCurrentScreen('profile')}
            onScheduleSelect={() => setCurrentScreen('schedule')}
          />
        );
      case 'routeDetail':
        return (
          <RouteDetail 
            routeId="RT001"
            routeName="Rota Central"
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'profile':
        return (
          <StudentProfile 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'schedule':
        return (
          <TransportSchedule 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      default:
        return <TransportDashboard studentName="João Silva" />;
    }
  };

  return renderScreen();
}
