
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CreateFight from '@/components/CreateFight';
import FightCard from '@/components/FightCard';
import FightTimeline from '@/components/FightTimeline';
import AuthPage from '@/components/AuthPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Gavel, Star, Timeline } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFights } from '@/hooks/useFights';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { fights, loading: fightsLoading } = useFights();
  const [currentView, setCurrentView] = useState('fights');

  // Show auth page if not authenticated
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleFightCreated = () => {
    setCurrentView('fights');
  };

  const userRole = profile?.role || 'fighter';
  const myFights = fights.filter(f => f.creator_id === user.id);
  const pendingFights = fights.filter(f => f.status === 'pending');
  const myMediatedFights = fights.filter(f => f.mediator_id === user.id);
  const resolvedFights = fights.filter(f => f.status === 'resolved');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      
      <div className="container mx-auto px-4 py-8">
        {currentView === 'create' && (
          <CreateFight onFightCreated={handleFightCreated} />
        )}
        
        {currentView === 'fights' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">My Fights</h2>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setCurrentView('timeline')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Timeline className="w-4 h-4 mr-2" />
                  View Timeline
                </Button>
                <Button 
                  onClick={() => setCurrentView('create')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Start New Fight
                </Button>
              </div>
            </div>
            
            {fightsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading fights...</p>
              </div>
            ) : myFights.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No fights yet</h3>
                <p className="text-gray-500 mb-4">Start your first conflict resolution journey</p>
                <Button 
                  onClick={() => setCurrentView('create')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Register Your First Fight
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myFights.map((fight) => (
                  <FightCard key={fight.id} fight={fight} />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'timeline' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">All Fights Timeline</h2>
              <Button 
                onClick={() => setCurrentView('fights')}
                variant="outline"
              >
                Back to My Fights
              </Button>
            </div>
            <FightTimeline fights={fights} loading={fightsLoading} />
          </div>
        )}
        
        {currentView === 'browse' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">All Active Fights</h2>
            {fightsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading fights...</p>
              </div>
            ) : pendingFights.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No active fights</h3>
                <p className="text-gray-500">All conflicts are resolved for now</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingFights.map((fight) => (
                  <FightCard key={fight.id} fight={fight} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentView === 'resolve' && userRole === 'trump' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Conflicts to Resolve</h2>
              <Badge className="bg-amber-100 text-amber-800 px-3 py-1">
                <Gavel className="w-4 h-4 mr-1" />
                Trump Mediator
              </Badge>
            </div>
            
            {fightsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading fights...</p>
              </div>
            ) : pendingFights.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No pending conflicts</h3>
                <p className="text-gray-500">All fights are resolved or in progress</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingFights.map((fight) => (
                  <FightCard 
                    key={fight.id} 
                    fight={fight} 
                    showResolveButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentView === 'resolved' && userRole === 'trump' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Resolved Cases</h2>
            {fightsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading fights...</p>
              </div>
            ) : myMediatedFights.filter(f => f.status === 'resolved').length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No resolved cases yet</h3>
                <p className="text-gray-500">Start mediating conflicts to build your reputation</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {myMediatedFights.filter(f => f.status === 'resolved').map((fight) => (
                  <FightCard key={fight.id} fight={fight} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
