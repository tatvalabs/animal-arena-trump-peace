
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';

interface Fight {
  id: string;
  title: string;
  description: string;
  animal1: { name: string; emoji: string; user: string };
  animal2: { name: string; emoji: string; user: string };
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
}

interface FightCardProps {
  fight: Fight;
  onResolve?: (fightId: string) => void;
  showResolveButton?: boolean;
}

const FightCard: React.FC<FightCardProps> = ({ fight, onResolve, showResolveButton = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              <span className="text-2xl">{fight.animal1.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{fight.animal1.name}</p>
                <p className="text-xs text-gray-500">{fight.animal1.user}</p>
              </div>
            </div>
            
            <div className="text-amber-600 font-bold">VS</div>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{fight.animal2.emoji}</span>
              <div>
                <p className="font-semibold text-sm">{fight.animal2.name}</p>
                <p className="text-xs text-gray-500">{fight.animal2.user}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{fight.createdAt}</span>
            </div>
            {showResolveButton && fight.status === 'pending' && (
              <Button 
                size="sm" 
                onClick={() => onResolve?.(fight.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Resolve Fight
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FightCard;
