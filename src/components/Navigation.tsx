
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, Plus, Gavel } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: 'fighter' | 'trump';
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, userRole }) => {
  const fighterItems = [
    { id: 'fights', label: 'My Fights', icon: Shield },
    { id: 'create', label: 'Start Fight', icon: Plus },
    { id: 'browse', label: 'Browse Fights', icon: Users },
  ];

  const trumpItems = [
    { id: 'resolve', label: 'Resolve Fights', icon: Gavel },
    { id: 'resolved', label: 'Resolved Cases', icon: Shield },
  ];

  const items = userRole === 'trump' ? trumpItems : fighterItems;

  return (
    <nav className="bg-green-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Ceasefire</h1>
        </div>
        
        <div className="flex space-x-2">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "secondary" : "ghost"}
                onClick={() => onViewChange(item.id)}
                className="text-white hover:bg-green-700"
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-amber-500 text-amber-900">
            {userRole === 'trump' ? '🦅 Trump' : '🐾 Fighter'}
          </Badge>
        </div>
      </div>
    </nav>
  );
};

const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

export default Navigation;
