
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Swords } from 'lucide-react';
import { useFights } from '@/hooks/useFights';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AnimalSelect from './AnimalSelect';

interface CreateFightProps {
  onFightCreated: () => void;
}

const CreateFight: React.FC<CreateFightProps> = ({ onFightCreated }) => {
  const { user } = useAuth();
  const { createFight } = useFights();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    opponent_email: '',
    creator_animal: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.opponent_email || !formData.creator_animal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including opponent email and your animal persona.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await createFight(formData);
      
      if (error) {
        console.error('Fight creation error:', error);
        toast({
          title: "Error Creating Fight",
          description: error.message || "Failed to create fight. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Fight Created! ⚔️",
          description: "Your conflict has been registered. Prepare for battle!",
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          opponent_email: '',
          creator_animal: ''
        });
        
        onFightCreated();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-2xl text-red-900 flex items-center">
            <Swords className="w-6 h-6 mr-2" />
            Register Your Conflict
          </CardTitle>
          <p className="text-red-700">
            Time to settle the score! Register your fight and let Trump mediate when things get heated.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-red-900 font-semibold">
                Fight Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="What's this fight about?"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="border-red-200 focus:border-red-500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-red-900 font-semibold">
                Conflict Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the conflict in detail..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="border-red-200 focus:border-red-500 min-h-[100px]"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="opponent_email" className="text-red-900 font-semibold">
                Opponent Email *
              </Label>
              <Input
                id="opponent_email"
                type="email"
                placeholder="Who are you fighting with? (email or @username)"
                value={formData.opponent_email}
                onChange={(e) => setFormData(prev => ({ ...prev, opponent_email: e.target.value }))}
                className="border-red-200 focus:border-red-500"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter their email address or @username to identify your opponent
              </p>
            </div>
            
            <div>
              <Label className="text-red-900 font-semibold mb-3 block">
                Choose Your Animal Persona *
              </Label>
              <div className="border-2 border-red-200 rounded-lg p-4 bg-white">
                <AnimalSelect
                  selectedAnimal={formData.creator_animal}
                  onAnimalSelect={(animalId) => setFormData(prev => ({ ...prev, creator_animal: animalId }))}
                />
              </div>
            </div>
            
            <div className="bg-red-100 p-4 rounded-lg border-2 border-red-200">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-red-800 text-sm">
                  <p className="font-semibold">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Your opponent will be notified and can accept the challenge</li>
                    <li>Other users can volunteer as Trump mediators</li>
                    <li>You can approve mediators to help resolve the conflict</li>
                    <li>Trump mediators can offer trade deals, threats, or counseling</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
            >
              {loading ? 'Creating Fight...' : '⚔️ Register Fight'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFight;
