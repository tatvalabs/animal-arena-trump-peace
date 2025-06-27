
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, User } from 'lucide-react';

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

interface ActionsBannerProps {
  fightInvites: Fight[];
  myMediatorRequests: MediatorRequest[];
  onViewFight: (fightId: string) => void;
  onViewProfile: () => void;
}

const ActionsBanner: React.FC<ActionsBannerProps> = ({
  fightInvites,
  myMediatorRequests,
  onViewFight,
  onViewProfile
}) => {
  const actionsNeeded = fightInvites.length + myMediatorRequests.length;

  if (actionsNeeded === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
        <h3 className="font-semibold text-red-800">Actions Required</h3>
      </div>
      
      {fightInvites.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">Fight Invitations ({fightInvites.length})</h4>
          <div className="space-y-2">
            {fightInvites.map((fight) => (
              <Card key={fight.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-orange-800">{fight.title}</p>
                      <p className="text-xs text-orange-600 flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Invited by: {fight.profiles?.username || fight.profiles?.email}
                      </p>
                    </div>
                    <Button 
                      onClick={() => onViewFight(fight.id)}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Respond
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {myMediatorRequests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2">Mediator Requests ({myMediatorRequests.length})</h4>
          <div className="space-y-2">
            {myMediatorRequests.map((request) => (
              <Card key={request.id} className="border-blue-200 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-blue-800">{request.fights?.title}</p>
                      <p className="text-xs text-blue-600">Mediator: {request.profiles?.username || request.profiles?.email}</p>
                    </div>
                    <Button 
                      onClick={onViewProfile}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsBanner;
