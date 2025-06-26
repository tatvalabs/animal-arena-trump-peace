
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Shield, 
  Trophy,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFights } from '@/hooks/useFights';
import { useMediatorRequests } from '@/hooks/useMediatorRequests';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { fights } = useFights();
  const { requests, respondToRequest } = useMediatorRequests();
  const { toast } = useToast();

  const myFights = fights.filter(f => f.creator_id === user?.id);
  const myMediatedFights = fights.filter(f => f.mediator_id === user?.id);
  const pendingRequests = requests.filter(r => 
    r.status === 'pending' && 
    r.fights?.creator_id === user?.id
  );

  const handleRequestResponse = async (requestId: string, response: 'approved' | 'rejected') => {
    const { error } = await respondToRequest(requestId, response);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to respond to request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: response === 'approved' ? "✅ Request Approved!" : "❌ Request Rejected",
        description: response === 'approved' 
          ? "The mediator has been assigned to your fight." 
          : "The mediation request has been declined."
      });
    }
  };

  const stats = {
    totalFights: myFights.length,
    resolvedFights: myFights.filter(f => f.status === 'resolved').length,
    mediatedFights: myMediatedFights.length,
    pendingRequests: pendingRequests.length
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`} />
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {profile?.username || 'Anonymous Fighter'}
              </h1>
              <p className="text-gray-600">{profile?.email}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">
                <Shield className="w-4 h-4 mr-1" />
                {profile?.role === 'trump' ? 'Trump Mediator' : 'Fighter'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalFights}</div>
            <div className="text-sm text-gray-600">Total Fights</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolvedFights}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.mediatedFights}</div>
            <div className="text-sm text-gray-600">Mediated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Mediator Requests ({stats.pendingRequests})</span>
          </TabsTrigger>
          <TabsTrigger value="fights" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>My Fights</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Pending Mediator Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending mediation requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{request.fights?.title}</h3>
                          <p className="text-sm text-gray-600">
                            From: {request.profiles?.username || request.profiles?.email}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      
                      <div className="bg-white p-3 rounded mb-3">
                        <p className="text-gray-700">{request.proposal_message}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleRequestResponse(request.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Mediator
                        </Button>
                        <Button
                          onClick={() => handleRequestResponse(request.id, 'rejected')}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                My Fights Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myFights.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No fights created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myFights.map((fight) => (
                    <div key={fight.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{fight.title}</h3>
                          <p className="text-sm text-gray-600">{fight.description}</p>
                        </div>
                        <Badge className={
                          fight.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          fight.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {fight.status}
                        </Badge>
                      </div>
                      {fight.resolution && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <p className="text-sm text-green-800">
                            <strong>Resolution:</strong> {fight.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Activity timeline coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
