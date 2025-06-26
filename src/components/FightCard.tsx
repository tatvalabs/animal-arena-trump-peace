
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Users, Gavel } from 'lucide-react';
import { useFights } from '@/hooks/useFights';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MediatorProposal from './MediatorProposal';

interface Fight {
  id: string;
  title: string;
  description: string;
  creator_animal: string;
  opponent_animal: string | null;
  status: string;
  created_at: string;
  creator_id: string;
  profiles?: {
    username: string | null;
    email: string | null;
  };
  mediator_profile?: {
    username: string | null;
    email: string | null;
  };
}

interface FightCardProps {
  fight: Fight;
  showResolveButton?: boolean;
  showMediatorProposal?: boolean;
  onViewFight?: (fightId: string) => void;
}

const animals = {
  lion: { name: 'Lion', emoji: '🦁' },
  owl: { name: 'Owl', emoji: '🦉' },
  fox: { name: 'Fox', emoji: '🦊' },
  bear: { name: 'Bear', emoji: '🐻' },
  rabbit: { name: 'Rabbit', emoji: '🐰' },
  elephant: { name: 'Elephant', emoji: '🐘' },
  wolf: { name: 'Wolf', emoji: '🐺' },
  eagle: { name: 'Eagle', emoji: '🦅' },
  tiger: { name: 'Tiger', emoji: '🐅' },
  shark: { name: 'Shark', emoji: '🦈' },
  dragon: { name: 'Dragon', emoji: '🐉' },
  snake: { name: 'Snake', emoji: '🐍' },
  gorilla: { name: 'Gorilla', emoji: '🦍' },
  cheetah: { name: 'Cheetah', emoji: '🐆' },
  rhino: { name: 'Rhino', emoji: '🦏' },
  octopus: { name: 'Octopus', emoji: '🐙' },
  dolphin: { name: 'Dolphin', emoji: '🐬' },
  turtle: { name: 'Turtle', emoji: '🐢' },
  penguin: { name: 'Penguin', emoji: '🐧' },
  flamingo: { name: 'Flamingo', emoji: '🦩' },
};

const FightCard: React.FC<FightCardProps> = ({ 
  fight, 
  showResolveButton = false, 
  showMediatorProposal = false,
  onViewFight 
}) => {
  const { user } = useAuth();
  const { takeFight } = useFights();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResolve = async () => {
    const { error } = await takeFight(fight.id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to take the fight.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Taking on the case! ⚖️",
        description: "You are now mediating this conflict.",
      });
    }
  };

  const handleMediatorProposal = async (fightId: string, proposal: string) => {
    // This would typically send a proposal to both fighters
    // For now, we'll simulate the approval process
    console.log('Mediator proposal:', { fightId, proposal });
    // In a real app, this would create a mediator_proposals table
  };

  const handleViewFight = () => {
    if (onViewFight) {
      onViewFight(fight.id);
    }
  };

  const creatorAnimal = animals[fight.creator_animal as keyof typeof animals];
  const timeAgo = new Date(fight.created_at).toLocaleDateString();
  const isCreator = fight.creator_id === user?.id;
  const canPropose = showMediatorProposal && !isCreator && fight.status === 'pending';

  return (
    <div className="space-y-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{fight.title}</CardTitle>
            <Badge className={getStatusColor(fight.status)}>
              {fight.status.replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">{fight.description}</p>
            
            <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{creatorAnimal?.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{creatorAnimal?.name}</p>
                  <p className="text-xs text-gray-500">{fight.profiles?.username || fight.profiles?.email}</p>
                </div>
              </div>
              
              <div className="text-amber-600 font-bold">VS</div>
              
              <div className="flex items-center space-x-2">
                <span className="text-2xl">❓</span>
                <div>
                  <p className="font-semibold text-sm">Seeking Opponent</p>
                  <p className="text-xs text-gray-500">TBD</p>
                </div>
              </div>
            </div>

            {fight.mediator_profile && (
              <div className="flex items-center justify-center bg-blue-50 p-3 rounded-lg">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face" 
                    alt="Trump Mediator" 
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-bold">🦅</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-bold text-blue-800">Trump Mediator</p>
                  <p className="text-xs text-blue-600">
                    {fight.mediator_profile.username || fight.mediator_profile.email}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex space-x-2">
                {onViewFight && (
                  <Button 
                    size="sm" 
                    onClick={handleViewFight}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    👁️ View Fight
                  </Button>
                )}
                {showResolveButton && fight.status === 'pending' && (
                  <Button 
                    size="sm" 
                    onClick={handleResolve}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Resolve Fight
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {canPropose && (
        <MediatorProposal
          fightId={fight.id}
          fightTitle={fight.title}
          onPropose={handleMediatorProposal}
          canPropose={canPropose}
        />
      )}
    </div>
  );
};

export default FightCard;
