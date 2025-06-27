
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gavel, User, CheckCircle, XCircle } from 'lucide-react';
import { useMediatorRequests } from '@/hooks/useMediatorRequests';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MediatorRequest {
  id: string;
  fight_id: string;
  mediator_id: string;
  proposal_message: string;
  status: string;
  accepted_by_creator: boolean | null;
  accepted_by_opponent: boolean | null;
  fights?: {
    title: string;
    creator_id: string;
    opponent_user_id: string | null;
  };
  profiles?: {
    username: string | null;
    email: string | null;
  };
}

interface MediatorRequestCardProps {
  request: MediatorRequest;
}

const MediatorRequestCard: React.FC<MediatorRequestCardProps> = ({ request }) => {
  const { user } = useAuth();
  const { acceptMediatorRequest } = useMediatorRequests();
  const { toast } = useToast();

  const isCreator = request.fights?.creator_id === user?.id;
  const isOpponent = request.fights?.opponent_user_id === user?.id;
  const canAccept = (isCreator && !request.accepted_by_creator) || (isOpponent && !request.accepted_by_opponent);
  const hasAccepted = (isCreator && request.accepted_by_creator) || (isOpponent && request.accepted_by_opponent);
  
  const bothAccepted = request.accepted_by_creator && request.accepted_by_opponent;

  const handleAccept = async () => {
    const { error } = await acceptMediatorRequest(request.id, isCreator);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept mediator request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "🎉 Mediator Accepted!",
        description: `You've accepted ${request.profiles?.username || 'the mediator'} as your conflict resolver!`,
      });
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <Gavel className="w-5 h-5 mr-2 text-blue-600" />
            Mediator Request for "{request.fights?.title}"
          </CardTitle>
          <Badge className={`${
            bothAccepted ? 'bg-green-100 text-green-800' :
            hasAccepted ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {bothAccepted ? '✅ Both Accepted' : 
             hasAccepted ? '⏳ Waiting for Other Player' : 
             '🔔 Needs Your Approval'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <p className="text-sm">
              <strong>Proposed Mediator:</strong> {request.profiles?.username || request.profiles?.email || 'Unknown'}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm text-gray-700">
              <strong>Proposal:</strong> {request.proposal_message}
            </p>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {request.accepted_by_creator ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs">Creator</span>
              </div>
              <div className="flex items-center space-x-1">
                {request.accepted_by_opponent ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-xs">Opponent</span>
              </div>
            </div>
            
            {canAccept && (
              <Button 
                onClick={handleAccept}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                ✅ Accept Mediator
              </Button>
            )}
          </div>

          {bothAccepted && (
            <div className="bg-green-100 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                🎉 Mediator approved by both players! The fight can now begin with moderation.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediatorRequestCard;
