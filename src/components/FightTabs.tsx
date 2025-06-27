
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Bell, Gavel, User } from 'lucide-react';
import FightCard from './FightCard';
import FightInviteCard from './FightInviteCard';
import MediatorRequestCard from './MediatorRequestCard';

interface Fight {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  opponent_email: string | null;
  creator_animal: string;
  opponent_animal: string | null;
  status: string;
  mediator_id: string | null;
  resolution: string | null;
  opponent_accepted: boolean | null;
  opponent_accepted_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    email: string | null;
  };
  mediator_profile?: {
    username: string | null;
    email: string | null;
  };
}

interface MediatorRequest {
  id: string;
  fight_id: string;
  mediator_id: string;
  proposal_message: string;
  status: string;
  creator_response: string | null;
  opponent_response: string | null;
  accepted_by_creator: boolean | null;
  accepted_by_opponent: boolean | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  fights?: {
    title: string;
    creator_id: string;
    opponent_user_id: string | null;
    opponent_email: string | null;
  };
  profiles?: {
    username: string | null;
    email: string | null;
  };
}

interface FightTabsProps {
  myFights: Fight[];
  fightInvites: Fight[];
  myMediatorRequests: MediatorRequest[];
  onViewFight: (fightId: string) => void;
  onCreateFight: () => void;
}

const FightTabs: React.FC<FightTabsProps> = ({
  myFights,
  fightInvites,
  myMediatorRequests,
  onViewFight,
  onCreateFight
}) => {
  return (
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
        <TabsTrigger value="mediator-requests" className="flex items-center space-x-2">
          <Gavel className="w-4 h-4" />
          <span>Mediator Requests ({myMediatorRequests.length})</span>
          {myMediatorRequests.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 ml-1">!</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-fights" className="space-y-4">
        {myFights.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No fights yet</h3>
            <p className="text-gray-500 mb-4">Start your first conflict resolution journey</p>
            <button 
              onClick={onCreateFight}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Register Your First Fight
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {myFights.map((fight) => (
              <FightCard 
                key={fight.id} 
                fight={fight} 
                onViewFight={onViewFight}
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
                <FightInviteCard 
                  key={fight.id}
                  fight={fight} 
                  onViewFight={onViewFight}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="mediator-requests" className="space-y-4">
        {myMediatorRequests.length === 0 ? (
          <div className="text-center py-12">
            <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No mediator requests</h3>
            <p className="text-gray-500">No mediation requests for your fights yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Gavel className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-800">Mediator Requests</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Proposed mediators for your fights. Both players must accept for mediation to begin.
              </p>
            </div>
            <div className="grid gap-4">
              {myMediatorRequests.map((request) => (
                <MediatorRequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default FightTabs;
