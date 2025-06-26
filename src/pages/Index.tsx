import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CreateFight from '@/components/CreateFight';
import FightCard from '@/components/FightCard';
import FightTimeline from '@/components/FightTimeline';
import FightDetailPage from '@/components/FightDetailPage';
import AuthPage from '@/components/AuthPage';
import ProfilePage from '@/components/ProfilePage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Gavel, Star, Clock, Bell, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFights } from '@/hooks/useFights';
import { useMediatorRequests } from '@/hooks/useMediatorRequests';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { fights, loading: fightsLoading } = useFights();
  const { requests } = useMediatorRequests();
  const [currentView, setCurrentView] = useState('fights');
  const [selectedFightId, setSelectedFightId] = useState<string | null>(null);

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

  const handleViewFight = (fightId: string) => {
    setSelectedFightId(fightId);
    setCurrentView('fight-detail');
  };

  const handleBackFromFight = () => {
    setSelectedFightId(null);
    setCurrentView('fights');
  };

  const userRole = profile?.role || 'fighter';
  const myFights = fights.filter(f => f.creator_id === user.id);
  const pendingFights = fights.filter(f => f.status === 'pending');
  const myMediatedFights = fights.filter(f => f.mediator_id === user.id);
  const resolvedFights = fights.filter(f => f.status === 'resolved');
  
  // New: Fight invites (fights where user is invited as opponent via email)
  const fightInvites = fights.filter(f => 
    f.opponent_email === user.email && f.creator_id !== user.id
  );
  
  // New: Fights needing user action
  const pendingMediatorRequests = requests.filter(r => 
    r.status === 'pending' && 
    r.fights?.creator_id === user.id
  );
  
  // New: Count of actions needed
  const actionsNeeded = fightInvites.length + pendingMediatorRequests.length;

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
            
            {fightsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading fights...</p>
              </div>
            ) : (
              <Tabs defaultValue="my-fights" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="my-fights" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>My Fights ({myFights.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="invites" className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>Fight Invites ({fightInvites.length})</span>
                    {fightInvites.length > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 ml-1">New</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Action Required ({pendingMediatorRequests.length})</span>
                    {pendingMediatorRequests.length > 0 && (
                      <Badge className="bg-red-100 text-red-800 ml-1">!</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="my-fights" className="space-y-4">
                  {myFights.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No fights yet</h3>
                      <p className="text-gray-500 mb-4">Start your first conflict resolution journey</p>
                      <Button 
                        onClick={() => setCurrentView('create')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Register Your First Fight
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {myFights.map((fight) => (
                        <FightCard 
                          key={fight.id} 
                          fight={fight} 
                          onViewFight={handleViewFight}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="invites" className="space-y-4">
                  {fightInvites.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No fight invites</h3>
                      <p className="text-gray-500">You haven't been invited to any fights yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <Bell className="w-5 h-5 text-orange-600 mr-2" />
                          <h3 className="font-semibold text-orange-800">Fight Invitations</h3>
                        </div>
                        <p className="text-sm text-orange-700 mt-1">
                          You've been invited to participate in these conflicts as an opponent.
                        </p>
                      </div>
                      <div className="grid gap-6">
                        {fightInvites.map((fight) => (
                          <div key={fight.id} className="relative">
                            <Badge className="absolute -top-2 -right-2 bg-orange-100 text-orange-800 z-10">
                              Invitation
                            </Badge>
                            <FightCard 
                              fight={fight} 
                              onViewFight={handleViewFight}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  {pendingMediatorRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No actions required</h3>
                      <p className="text-gray-500">All requests have been reviewed</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                          <h3 className="font-semibold text-red-800">Mediator Requests Pending</h3>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          These mediator requests need your approval or rejection.
                        </p>
                      </div>
                      <div className="grid gap-4">
                        {pendingMediatorRequests.map((request) => (
                          <Card key={request.id} className="border-red-200 bg-red-50">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{request.fights?.title}</CardTitle>
                                <Badge className="bg-red-100 text-red-800">Action Required</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    <strong>Mediator:</strong> {request.profiles?.username || request.profiles?.email}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <strong>Proposal:</strong> {request.proposal_message}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => setCurrentView('profile')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Review in Profile
                                  </Button>
                                  <Button 
                                    onClick={() => handleViewFight(request.fight_id)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    View Fight
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
              <Button 
                onClick={() => setCurrentView('fights')}
                variant="outline"
              >
                Back to My Fights
              </Button>
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
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
