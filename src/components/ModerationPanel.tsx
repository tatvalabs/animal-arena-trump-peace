
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Gavel, Zap, DollarSign, Brain, Handshake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ModerationPanelProps {
  fightId: string;
  onModerationAction: () => void;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({ fightId, onModerationAction }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationMessage, setModerationMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const moderationActions = [
    { id: 'penalty', emoji: '🔨', label: 'Penalty', icon: Gavel, description: 'Issue a penalty to a fighter' },
    { id: 'warning', emoji: '⚠️', label: 'Warning', icon: Zap, description: 'Give a warning to maintain order' },
    { id: 'motivation', emoji: '💪', label: 'Motivation', icon: Brain, description: 'Motivate the fighters' },
    { id: 'trade', emoji: '💰', label: 'Trade Deal', icon: DollarSign, description: 'Propose a trade resolution' },
    { id: 'mediate', emoji: '🤝', label: 'Mediate', icon: Handshake, description: 'Facilitate negotiation' },
    { id: 'timeout', emoji: '⏰', label: 'Timeout', icon: Zap, description: 'Call for a break' },
  ];

  const handleModerationAction = async () => {
    if (!user || !selectedAction || !moderationMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an action and provide a message.",
        variant: "destructive"
      });
      return;
    }

    const action = moderationActions.find(a => a.id === selectedAction);
    const message = `${action?.emoji} ${action?.label}: ${moderationMessage}`;

    try {
      // Add activity to fight
      const { error } = await supabase
        .from('fight_activities')
        .insert([{
          fight_id: fightId,
          user_id: user.id,
          activity_type: 'moderation_action',
          message: message
        }]);

      if (error) throw error;

      toast({
        title: `${action?.emoji} Moderation Action Taken!`,
        description: `${action?.label} has been applied to the fight.`,
      });

      setModerationMessage('');
      setSelectedAction('');
      onModerationAction();
    } catch (error) {
      console.error('Error taking moderation action:', error);
      toast({
        title: "Error",
        description: "Failed to take moderation action.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-900 flex items-center">
          <Gavel className="w-5 h-5 mr-2" />
          🦅 Trump Moderation Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              Select Moderation Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              {moderationActions.map((action) => (
                <Button
                  key={action.id}
                  variant={selectedAction === action.id ? "default" : "outline"}
                  className={`h-auto p-3 flex-col space-y-1 ${
                    selectedAction === action.id 
                      ? 'bg-purple-600 text-white' 
                      : 'border-purple-300 hover:bg-purple-100'
                  }`}
                  onClick={() => setSelectedAction(action.id)}
                >
                  <div className="text-lg">{action.emoji}</div>
                  <div className="text-xs font-medium">{action.label}</div>
                </Button>
              ))}
            </div>
          </div>

          {selectedAction && (
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Moderation Message
              </label>
              <Textarea
                placeholder={`Explain your ${moderationActions.find(a => a.id === selectedAction)?.label.toLowerCase()}...`}
                value={moderationMessage}
                onChange={(e) => setModerationMessage(e.target.value)}
                rows={3}
                className="border-purple-200"
              />
            </div>
          )}

          <div className="bg-purple-100 p-3 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Moderator Powers:</strong> As Trump mediator, you can penalize fighters 🔨, 
              issue warnings ⚠️, motivate with speeches 💪, propose trade deals 💰, 
              facilitate negotiations 🤝, or call timeouts ⏰.
            </p>
          </div>

          <Button
            onClick={handleModerationAction}
            disabled={!selectedAction || !moderationMessage.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            🎯 Execute Moderation Action
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModerationPanel;
