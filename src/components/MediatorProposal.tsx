
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Gavel, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMediatorRequests } from '@/hooks/useMediatorRequests';

interface MediatorProposalProps {
  fightId: string;
  fightTitle: string;
  canPropose: boolean;
}

const MediatorProposal: React.FC<MediatorProposalProps> = ({ 
  fightId, 
  fightTitle, 
  canPropose 
}) => {
  const [proposal, setProposal] = useState('');
  const [isProposing, setIsProposing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { createRequest } = useMediatorRequests();

  const handlePropose = async () => {
    if (!proposal.trim()) {
      toast({
        title: "Missing Proposal",
        description: "Please explain why you want to mediate this conflict.",
        variant: "destructive"
      });
      return;
    }

    setIsProposing(true);
    try {
      const { error } = await createRequest(fightId, proposal);
      if (error) {
        throw error;
      }
      
      toast({
        title: "🦅 Mediation Proposal Sent!",
        description: "The fighter will be notified of your proposal.",
      });
      setProposal('');
      setShowForm(false);
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast({
        title: "Error",
        description: "Failed to send proposal. Please try again.",
        variant: "destructive"
      });
    }
    setIsProposing(false);
  };

  if (!canPropose) {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Avatar className="w-8 h-8 mr-3">
            <AvatarImage 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face" 
              alt="Trump Mediator" 
            />
            <AvatarFallback className="bg-blue-600 text-white font-bold">🦅</AvatarFallback>
          </Avatar>
          <Gavel className="w-5 h-5 mr-2" />
          Volunteer as Trump Mediator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showForm ? (
          <div className="space-y-3">
            <p className="text-blue-800">
              Want to help resolve "<strong>{fightTitle}</strong>"? 
              Propose yourself as the Trump mediator!
            </p>
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <CheckCircle className="w-4 h-4" />
              <span>The fighter must approve your mediation</span>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              🦅 Propose as Mediator
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Why should you mediate this conflict?
              </label>
              <Textarea
                placeholder="I believe I can help resolve this conflict because..."
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                rows={3}
                className="border-blue-200"
              />
            </div>
            
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="flex items-start space-x-2 text-sm">
                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-blue-800">
                  <p className="font-medium">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                    <li>Your proposal will be sent to the fighter</li>
                    <li>They must approve you as mediator</li>
                    <li>Once approved, you can offer trade deals, threats, counseling, or negotiation</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handlePropose}
                disabled={isProposing || !proposal.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isProposing ? 'Sending...' : '🎯 Send Proposal'}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setProposal('');
                }}
                variant="outline"
                className="border-blue-600 text-blue-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediatorProposal;
