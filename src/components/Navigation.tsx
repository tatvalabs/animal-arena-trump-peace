
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, Star, Gavel, User, Eye, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useMediatorRequests } from '@/hooks/useMediatorRequests';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { requests } = useMediatorRequests();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const userRole = profile?.role || 'fighter';
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const navItems = [
    {
      id: 'fights',
      label: 'My Fights',
      icon: Shield,
      color: 'bg-red-600 hover:bg-red-700 text-white',
      show: true
    },
    {
      id: 'create',
      label: 'Start Fight',
      icon: Users,
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      show: true
    },
    {
      id: 'browse',
      label: 'Browse Fights',
      icon: Eye,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      show: true
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      show: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      show: true,
      badge: pendingRequests > 0 ? pendingRequests : null
    },
    {
      id: 'resolve',
      label: 'Resolve',
      icon: Gavel,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      show: userRole === 'trump'
    },
    {
      id: 'resolved',
      label: 'Resolved',
      icon: Star,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      show: userRole === 'trump'
    }
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-xl font-bold text-gray-800">Ceasefire</h1>
            {userRole === 'trump' && (
              <Badge className="bg-amber-100 text-amber-800 ml-2">
                <Gavel className="w-3 h-3 mr-1" />
                Trump Mediator
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {navItems.filter(item => item.show).map((item) => (
              <div key={item.id} className="relative">
                <Button
                  onClick={() => onViewChange(item.id)}
                  variant={currentView === item.id ? "default" : "outline"}
                  className={currentView === item.id ? item.color : "border-gray-300 hover:bg-gray-50"}
                  size="sm"
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </div>
            ))}
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
