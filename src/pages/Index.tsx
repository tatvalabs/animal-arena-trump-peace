
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import CreateFight from '@/components/CreateFight';
import FightCard from '@/components/FightCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Gavel, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockFights = [
  {
    id: '1',
    title: 'Project Deadline Disagreement',
    description: 'We cannot agree on the realistic timeline for the new website launch.',
    animal1: { name: 'Lion', emoji: '🦁', user: 'Sarah K.' },
    animal2: { name: 'Owl', emoji: '🦉', user: 'Mike R.' },
    status: 'pending' as const,
    createdAt: '2 hours ago'
  },
  {
    id: '2',
    title: 'Office Space Allocation',
    description: 'Dispute over who gets the corner office after the promotion.',
    animal1: { name: 'Bear', emoji: '🐻', user: 'John D.' },
    animal2: { name: 'Fox', emoji: '🦊', user: 'Lisa M.' },
    status: 'in-progress' as const,
    createdAt: '1 day ago'
  },
  {
    id: '3',
    title: 'Budget Distribution',
    description: 'Marketing vs Development budget allocation for Q2.',
    animal1: { name: 'Eagle', emoji: '🦅', user: 'Tom W.' },
    animal2: { name: 'Elephant', emoji: '🐘', user: 'Anna S.' },
    status: 'resolved' as const,
    createdAt: '3 days ago'
  }
];

const Index = () => {
  const [currentView, setCurrentView] = useState('welcome');
  const [userRole, setUserRole] = useState<'fighter' | 'trump'>('fighter');
  const { toast } = useToast();

  const handleRoleSelect = (role: 'fighter' | 'trump') => {
    setUserRole(role);
    setCurrentView(role === 'trump' ? 'resolve' : 'fights');
    toast({
      title: `Welcome, ${role === 'trump' ? 'Mediator' : 'Fighter'}! 🎉`,
      description: `You are now registered as a ${role === 'trump' ? 'conflict resolver' : 'participant'}.`
    });
  };

  const handleResolveFight = (fightId: string) => {
    toast({
      title: "Taking on the case! ⚖️",
      description: "You are now mediating this conflict.",
    });
  };

  const handleFightCreated = () => {
    setCurrentView('fights');
  };

  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Shield className="w-16 h-16 text-green-600" />
              <h1 className="text-6xl font-bold text-green-800">Ceasefire</h1>
            </div>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Resolve conflicts through the wisdom of animal personas. Choose your spirit animal and let nature guide the path to peace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-green-400" onClick={() => handleRoleSelect('fighter')}>
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🐾</div>
                <CardTitle className="text-2xl text-green-700">Join as Fighter</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Register your conflicts and represent yourself through an animal persona
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Choose your animal spirit</li>
                  <li>• Submit conflicts for resolution</li>
                  <li>• Track your cases</li>
                </ul>
                <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
                  Start Fighting 🥊
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-amber-400" onClick={() => handleRoleSelect('trump')}>
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">🦅</div>
                <CardTitle className="text-2xl text-amber-700">Join as Trump</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Become a mediator and help resolve conflicts with wisdom and fairness
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li>• Review pending conflicts</li>
                  <li>• Provide resolution guidance</li>
                  <li>• Build your mediation reputation</li>
                </ul>
                <Button className="w-full bg-amber-600 hover:bg-amber-700 mt-4">
                  Become Mediator ⚖️
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl mb-4">🐺</div>
                <h3 className="font-semibold mb-2">Choose Your Animal</h3>
                <p className="text-sm text-gray-600">Select an animal that represents your conflict style</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h3 className="font-semibold mb-2">Register Conflict</h3>
                <p className="text-sm text-gray-600">Describe your dispute with the other party</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🕊️</div>
                <h3 className="font-semibold mb-2">Find Peace</h3>
                <p className="text-sm text-gray-600">Let a Trump mediator guide you to resolution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        userRole={userRole}
      />
      
      <div className="container mx-auto px-4 py-8">
        {currentView === 'create' && (
          <CreateFight onFightCreated={handleFightCreated} />
        )}
        
        {currentView === 'fights' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">My Fights</h2>
              <Button 
                onClick={() => setCurrentView('create')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Start New Fight
              </Button>
            </div>
            
            <div className="grid gap-6">
              {mockFights.slice(0, 2).map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </div>
        )}
        
        {currentView === 'browse' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">All Active Fights</h2>
            <div className="grid gap-6">
              {mockFights.filter(f => f.status !== 'resolved').map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </div>
        )}
        
        {currentView === 'resolve' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Conflicts to Resolve</h2>
              <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                <Gavel className="w-4 h-4 mr-1" />
                Trump Mediator
              </Badge>
            </div>
            
            <div className="grid gap-6">
              {mockFights.filter(f => f.status === 'pending').map((fight) => (
                <FightCard 
                  key={fight.id} 
                  fight={fight} 
                  onResolve={handleResolveFight}
                  showResolveButton={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {currentView === 'resolved' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Resolved Cases</h2>
            <div className="grid gap-6">
              {mockFights.filter(f => f.status === 'resolved').map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
