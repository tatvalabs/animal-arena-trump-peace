import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CreateFight from '@/components/CreateFight';
import FightTimeline from '@/components/FightTimeline';
import FightDetailPage from '@/components/FightDetailPage';
import AuthPage from '@/components/AuthPage';
import ProfilePage from '@/components/ProfilePage';
import FightTabs from '@/components/FightTabs';
import ActionsBanner from '@/components/ActionsBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, Star, Gavel, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFights } from '@/hooks/useFights';
import { useMediatorRequests } from '@/hooks/useMediatorRequests';
import FightCard from '@/components/FightCard';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { fights, loading: fightsLoading, refetch } = useFights();
  const { requests } = useMediatorRequests();
  const [currentView, setCurrentView] = useState('fights');
  const [selectedFightId, setSelectedFightId] = useState<string | null>(null);

  // Auto-refresh fights data when view changes to ensure latest data
  useEffect(() => {
    if (user && (currentView === 'browse' || currentView === 'timeline')) {
      refetch();
    }
  }, [currentView, user, refetch]);

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
    // Refresh data after fight creation
    setTimeout(() => refetch(), 500);
  };

  const handleViewFight = (fightId: string) => {
    setSelectedFightId(fightId);
    setCurrentView('fight-detail');
  };

  const handleBackFromFight = () => {
    setSelectedFightId(null);
    setCurrentView('fights');
    // Refresh data when returning from fight detail
    setTimeout(() => refetch(), 500);
  };

  const userRole = profile?.role || 'fighter';
  const myFights = fights.filter(f => f.creator_id === user.id);
  const pendingFights = fights.filter(f => f.status === 'pending');
  const myMediatedFights = fights.filter(f => f.mediator_id === user.id);
  
  // Fight invites (fights where user is invited as opponent via email)
  const fightInvites = fights.filter(f => 
    f.opponent_email === user.email && 
    f.creator_id !== user.id && 
    !f.opponent_accepted
  );
  
  // Mediator requests that need user action
  const myMediatorRequests = requests.filter(r => 
    (r.fights?.creator_id === user.id || r.fights?.opponent_email === user.email) &&
    r.status === 'pending'
  );
  
  // Count of actions needed
  const actionsNeeded = fightInvites.length + myMediatorRequests.length;

  if (currentView === 'fight-detail' && selectedFightId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
        />
        <div className="container mx-auto px-4 py-8">
          <FightDetailPage 
            fightId={selectedFightId} 
            onBack={handleBackFromFight}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          currentView={currentView} 
          onViewChange={setCurrentView}
        />
        <div className="container mx-auto px-4 py-8">
          <ProfilePage />
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold text-gray-800">My Fights</h2>
                {actionsNeeded > 0 && (
                  <Badge className="bg-red-100 text-red-800 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {actionsNeeded} Action{actionsNeeded > 1 ? 's' : ''} Needed
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setCurrentView('timeline')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Timeline
                </Button>
                <Button 
                  onClick={() => setCurrentView('create')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Start New Fight
                </Button>
              </div>
            </div>

            <ActionsBanner 
              fightInvites={fightInvites}
              myMediatorRequests={myMediatorRequests}
              onViewFight={handleViewFight}
              onViewProfile={() => setCurrentView('profile')}
            />
            
            {fightsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading fights...</p>
              </div>
            ) : (
              <FightTabs
                myFights={myFights}
                fightInvites={fightInvites}
                myMediatorRequests={myMediatorRequests}
                onViewFight={handleViewFight}
                onCreateFight={() => setCurrentView('create')}
              />
            )}
          </div>
        )}

        {currentView === 'browse' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Browse All Fights</h2>
                <p className="text-gray-600 mt-1">Global timeline of all ongoing conflicts</p>
              </div>
              <Button 
                onClick={() => refetch()}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                🔄 Refresh
              </Button>
            </div>
            
            <div className="space-y-6">
              {fightsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading fights...</p>
                </div>
              ) : fights.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No fights yet</h3>
                  <p className="text-gray-500">Be the first to start a conflict!</p>
                </div>
              ) : (
                fights
                  .sort((a, b) => {
                    const aTime = new Date(a.updated_at || a.created_at).getTime();
                    const bTime = new Date(b.updated_at || b.created_at).getTime();
                    return bTime - aTime;
                  })
                  .map((fight) => (
                    <FightCard 
                      key={fight.id} 
                      fight={fight} 
                      onViewFight={handleViewFight}
                      showMediatorProposal={fight.creator_id !== user.id}
                    />
                  ))
              )}
            </div>
          </div>
        )}

        {currentView === 'timeline' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">My Activity Timeline</h2>
                <p className="text-gray-600 mt-1">Historical record of your fights and mediations</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  🔄 Refresh
                </Button>
                <Button 
                  onClick={() => setCurrentView('fights')}
                  variant="outline"
                >
                  Back to My Fights
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {fightsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading timeline...</p>
                </div>
              ) : [...myFights, ...myMediatedFights].length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No activity yet</h3>
                  <p className="text-gray-500">Your activity timeline will appear here</p>
                </div>
              ) : (
                [...myFights, ...myMediatedFights]
                  .sort((a, b) => {
                    const aTime = new Date(a.updated_at || a.created_at).getTime();
                    const bTime = new Date(b.updated_at || b.created_at).getTime();
                    return bTime - aTime;
                  })
                  .map((fight) => (
                    <FightCard 
                      key={fight.id} 
                      fight={fight} 
                      onViewFight={handleViewFight}
                    />
                  ))
              )}
            </div>
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
                    onViewFight={handleViewFight}
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
                  <FightCard 
                    key={fight.id} 
                    fight={fight} 
                    onViewFight={handleViewFight}
                  />
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