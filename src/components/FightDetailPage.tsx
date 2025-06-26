import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Users, 
  Clock, 
  DollarSign, 
  Zap, 
  Brain, 
  Handshake, 
  Eye,
  MessageSquare,
  Bell,
  Star,
  Gavel,
} from 'lucide-react';
import { useFights } from '@/hooks/useFights';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface FightDetailPageProps {
  fightId: string;
  onBack: () => void;
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

const FightDetailPage: React.FC<FightDetailPageProps> = ({ fightId, onBack }) => {
  const { fights, takeFight, resolveFight } = useFights();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [isWatching, setIsWatching] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [mediationComments, setMediationComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedMediationType, setSelectedMediationType] = useState('');
  const [mediationAmount, setMediationAmount] = useState('');
  const [showMediationDialog, setShowMediationDialog] = useState(false);

  const fight = fights.find(f => f.id === fightId);
  const userRole = profile?.role || 'fighter';
  const isTrump = userRole === 'trump';
  const isCreator = fight?.creator_id === user?.id;
  const canMediate = isTrump && fight?.status === 'pending';

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSpectatorCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const mediationOptions = [
    {
      id: 'trade',
      label: 'Trade Deal',
      icon: DollarSign,
      emoji: '💰',
      description: 'Offer money, resources, or favors to resolve conflict',
      color: 'bg-green-100 text-green-800 hover:bg-green-200'
    },
    {
      id: 'threat',
      label: 'Intimidation',
      icon: Zap,
      emoji: '⚡',
      description: 'Use threats and pressure to force compliance',
      color: 'bg-red-100 text-red-800 hover:bg-red-200'
    },
    {
      id: 'counseling',
      label: 'Therapy Session',
      icon: Brain,
      emoji: '🧠',
      description: 'Provide counseling to address underlying issues',
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      icon: Handshake,
      emoji: '🤝',
      description: 'Propose compromises and middle ground solutions',
      color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    }
  ];

  const handleWatch = () => {
    setIsWatching(!isWatching);
    setSpectatorCount(prev => isWatching ? prev - 1 : prev + 1);
    toast({
      title: isWatching ? "Stopped watching fight" : "Now watching fight! 👀",
      description: isWatching ? "You'll no longer receive notifications" : "You'll get notifications about mediation attempts"
    });
  };

  const handleTakeFight = async () => {
    const { error } = await takeFight(fightId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to take the fight.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "🦅 Trump has entered the arena!",
        description: "Time to make some deals and resolve this conflict!",
      });
    }
  };

  const handleMediation = async () => {
    if (!selectedMediationType || !newComment.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a mediation type and provide details.",
        variant: "destructive"
      });
      return;
    }

    const mediationType = mediationOptions.find(opt => opt.id === selectedMediationType);
    let resolutionText = `🦅 Trump's ${mediationType?.label}: ${newComment}`;
    
    if (selectedMediationType === 'trade' && mediationAmount) {
      resolutionText += ` (Amount: $${mediationAmount})`;
    }

    const { error } = await resolveFight(fightId, resolutionText);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to resolve the fight.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "🎉 Ceasefire Achieved!",
        description: "The conflict has been resolved through Trump's mediation!",
      });
      setShowMediationDialog(false);
      setNewComment('');
      setMediationAmount('');
      setSelectedMediationType('');
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: profile?.username || 'Anonymous',
      text: newComment,
      timestamp: new Date().toLocaleTimeString(),
      type: 'spectator'
    };
    
    setMediationComments([...mediationComments, comment]);
    setNewComment('');
    
    toast({
      title: "Comment added! 💬",
      description: "Your observation has been shared with other spectators."
    });
  };

  if (!fight) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Fight not found</h3>
        <Button onClick={onBack} variant="outline">Go Back</Button>
      </div>
    );
  }

  const creatorAnimal = animals[fight.creator_animal as keyof typeof animals];
  const timeAgo = new Date(fight.created_at).toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">← Back to Fights</Button>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
            <Eye className="w-4 h-4 mr-1" />
            {spectatorCount} watching
          </Badge>
          {!isCreator && (
            <Button
              onClick={handleWatch}
              variant={isWatching ? "destructive" : "outline"}
              size="sm"
            >
              {isWatching ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Stop Watching
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Watch Fight
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Fight Details */}
      <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl text-amber-900">{fight.title}</CardTitle>
            <Badge className={`${
              fight.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              fight.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            } px-3 py-1 text-lg`}>
              {fight.status === 'in-progress' ? '⚔️ Battle in Progress' : 
               fight.status === 'resolved' ? '🏆 Resolved' : '⏳ Awaiting Mediator'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">{fight.description}</p>
            
            {/* Fighters */}
            <div className="bg-white p-4 rounded-lg border-2 border-amber-200">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Combatants
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{creatorAnimal?.emoji}</span>
                  <div>
                    <p className="font-bold text-lg">{creatorAnimal?.name}</p>
                    <p className="text-sm text-gray-600">{fight.profiles?.username || fight.profiles?.email}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">VS</div>
                  <div className="text-xs text-gray-500">Conflict Zone</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-bold text-lg">Seeking Opponent</p>
                    <p className="text-sm text-gray-600">Open Challenge</p>
                  </div>
                  <span className="text-4xl">❓</span>
                </div>
              </div>
            </div>

            {/* Mediation Section */}
            {fight.status === 'resolved' && fight.resolution && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <h3 className="font-bold text-green-900 mb-2 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Resolution
                </h3>
                <p className="text-green-800">{fight.resolution}</p>
                {fight.mediator_profile && (
                  <p className="text-sm text-green-600 mt-2">
                    Resolved by: {fight.mediator_profile.username || fight.mediator_profile.email}
                  </p>
                )}
              </div>
            )}

            {/* Trump Actions */}
            {canMediate && (
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face" 
                      alt="Trump Mediator" 
                    />
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">🦅</AvatarFallback>
                  </Avatar>
                  <Gavel className="w-5 h-5 mr-2" />
                  Trump Mediation Center
                </h3>
                <div className="space-y-3">
                  {fight.mediator_id !== user?.id ? (
                    <Button 
                      onClick={handleTakeFight}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      🦅 Take Control of This Conflict
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-blue-800 font-medium">You are mediating this conflict!</p>
                      <div className="grid grid-cols-2 gap-2">
                        {mediationOptions.map((option) => (
                          <Dialog key={option.id}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className={`${option.color} border-2 p-4 h-auto flex-col space-y-2`}
                                onClick={() => {
                                  setSelectedMediationType(option.id);
                                  setShowMediationDialog(true);
                                }}
                              >
                                <div className="text-2xl">{option.emoji}</div>
                                <div className="font-semibold">{option.label}</div>
                                <div className="text-xs text-center">{option.description}</div>
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Spectator Comments */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Spectator Commentary ({spectatorCount} watching)
              </h3>
              
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {mediationComments.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  mediationComments.map((comment) => (
                    <div key={comment.id} className="bg-white p-2 rounded text-sm">
                      <span className="font-medium text-blue-600">{comment.user}</span>
                      <span className="text-gray-500 text-xs ml-2">{comment.timestamp}</span>
                      <p className="text-gray-700 mt-1">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Share your thoughts on this conflict..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  Post
                </Button>
              </div>
            </div>

            {/* Fight Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Created: {timeAgo}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{spectatorCount} spectators</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mediation Dialog */}
      <Dialog open={showMediationDialog} onOpenChange={setShowMediationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Gavel className="w-6 h-6 mr-2" />
              {mediationOptions.find(opt => opt.id === selectedMediationType)?.emoji} {mediationOptions.find(opt => opt.id === selectedMediationType)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              {mediationOptions.find(opt => opt.id === selectedMediationType)?.description}
            </p>
            
            {selectedMediationType === 'trade' && (
              <div>
                <label className="block text-sm font-medium mb-2">Deal Amount ($)</label>
                <input
                  type="number"
                  placeholder="Enter amount..."
                  value={mediationAmount}
                  onChange={(e) => setMediationAmount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {selectedMediationType === 'threat' ? 'Intimidation Message' :
                 selectedMediationType === 'counseling' ? 'Therapeutic Approach' :
                 selectedMediationType === 'trade' ? 'Deal Details' :
                 'Negotiation Terms'}
              </label>
              <Textarea
                placeholder={
                  selectedMediationType === 'threat' ? 'Describe your intimidation strategy...' :
                  selectedMediationType === 'counseling' ? 'How will you help them resolve their issues?' :
                  selectedMediationType === 'trade' ? 'What are you offering in exchange for peace?' :
                  'What compromise do you propose?'
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleMediation}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newComment.trim()}
              >
                🎯 Execute Mediation
              </Button>
              <Button
                onClick={() => setShowMediationDialog(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FightDetailPage;
