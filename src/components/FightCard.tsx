import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';
import { useFights } from '@/hooks/useFights';
import { useToast } from '@/hooks/use-toast';

interface Fight {
  id: string;
  title: string;
  description: string;
  creator_animal: string;
  opponent_animal: string | null;
  status: string;
  created_at: string;
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
};

const FightCard: React.FC<FightCardProps> = ({ fight, showResolveButton = false, onViewFight }) => {
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

  const handleViewFight = () => {
    if (onViewFight) {
      onViewFight(fight.id);
    }
  };

  const creatorAnimal = animals[fight.creator_animal as keyof typeof animals];
  const timeAgo = new Date(fight.created_at).toLocaleDateString();

  return (
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
  );
};

export default FightCard;
