
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Users, Gavel, CheckCircle } from 'lucide-react';

interface Fight {
  id: string;
  title: string;
  description: string;
  creator_animal: string;
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

interface FightTimelineProps {
  fights: Fight[];
  loading: boolean;
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

const FightTimeline: React.FC<FightTimelineProps> = ({ fights, loading, onViewFight }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in-progress': return <Gavel className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedFights = [...fights].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading timeline...</p>
      </div>
    );
  }

  if (fights.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No fights yet</h3>
        <p className="text-gray-500">The timeline will show all fights as they are created</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {sortedFights.map((fight, index) => {
          const creatorAnimal = animals[fight.creator_animal as keyof typeof animals];
          const timeAgo = new Date(fight.created_at).toLocaleDateString();
          
          return (
            <div key={fight.id} className="relative flex items-start space-x-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-16 h-16 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center">
                {getStatusIcon(fight.status)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{fight.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(fight.status)}>
                          {fight.status.replace('-', ' ')}
                        </Badge>
                        {fight.status === 'pending' && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Gavel className="w-3 h-3 mr-1" />
                            Needs Mediator
                          </Badge>
                        )}
                        {onViewFight && (
                          <Button 
                            size="sm" 
                            onClick={() => onViewFight(fight.id)}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            👁️ View
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-600 text-sm line-clamp-2">{fight.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{creatorAnimal?.emoji}</span>
                          <div>
                            <p className="font-medium text-sm">{creatorAnimal?.name}</p>
                            <p className="text-xs text-gray-500">
                              {fight.profiles?.username || fight.profiles?.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{timeAgo}</p>
                          {fight.mediator_profile ? (
                            <div className="flex items-center space-x-1">
                              <Avatar className="w-4 h-4">
                                <AvatarImage 
                                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=50&h=50&fit=crop&crop=face" 
                                  alt="Trump" 
                                />
                                <AvatarFallback className="bg-blue-600 text-white text-xs">🦅</AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-blue-600 font-medium">
                                Trump: {fight.mediator_profile.username || fight.mediator_profile.email}
                              </p>
                            </div>
                          ) : fight.status === 'pending' && (
                            <p className="text-xs text-amber-600 font-medium">
                              🔔 Seeking Trump Mediator
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FightTimeline;
