
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, User } from 'lucide-react';
import { useFights } from '@/hooks/useFights';
import { useToast } from '@/hooks/use-toast';
import AnimalSelect from './AnimalSelect';

interface Fight {
  id: string;
  title: string;
  description: string;
  creator_animal: string;
  opponent_accepted: boolean | null;
  status: string;
  created_at: string;
  creator_id: string;
  profiles?: {
    username: string | null;
    email: string | null;
  };
}

interface FightInviteCardProps {
  fight: Fight;
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

const FightInviteCard: React.FC<FightInviteCardProps> = ({ 
  fight, 
  onViewFight 
}) => {
  const { acceptFightInvitation } = useFights();
  const { toast } = useToast();
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptFight = async () => {
    if (!selectedAnimal) {
      toast({
        title: "Choose Your Animal",
        description: "Please select an animal before accepting the fight.",
        variant: "destructive"
      });
      return;
    }

    setIsAccepting(true);
    const { error } = await acceptFightInvitation(fight.id, selectedAnimal);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept fight invitation.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "🥊 Fight Accepted!",
        description: `You've joined the fight as ${animals[selectedAnimal as keyof typeof animals]?.name}!`,
      });
    }
    setIsAccepting(false);
  };

  const handleViewFight = () => {
    if (onViewFight) {
      onViewFight(fight.id);
    }
  };

  const creatorAnimal = animals[fight.creator_animal as keyof typeof animals];
  const timeAgo = new Date(fight.created_at).toLocaleDateString();
  const isAlreadyAccepted = fight.opponent_accepted;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <Mail className="w-5 h-5 mr-2 text-orange-600" />
            {fight.title}
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-800">
            {isAlreadyAccepted ? 'Accepted' : 'Invitation'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">{fight.description}</p>
          
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{creatorAnimal?.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{creatorAnimal?.name}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {fight.profiles?.username || fight.profiles?.email}
                </p>
              </div>
            </div>
            
            <div className="text-orange-600 font-bold">VS</div>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl">❓</span>
              <div>
                <p className="font-semibold text-sm text-orange-600">You're Invited!</p>
                <p className="text-xs text-gray-500">Choose your animal</p>
              </div>
            </div>
          </div>

          {!isAlreadyAccepted && (
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                <p className="font-semibold text-orange-800">Accept Fight Invitation</p>
              </div>
              <div className="space-y-3">
                <AnimalSelect
                  value={selectedAnimal}
                  onValueChange={setSelectedAnimal}
                  placeholder="Choose your fighting animal"
                />
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleAcceptFight}
                    disabled={!selectedAnimal || isAccepting}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    {isAccepting ? 'Accepting...' : '✊ Accept Fight'}
                  </Button>
                  {onViewFight && (
                    <Button 
                      onClick={handleViewFight}
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      👁️ View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAlreadyAccepted && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span>Accepted on {timeAgo}</span>
              </div>
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FightInviteCard;
