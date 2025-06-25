
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AnimalSelect from './AnimalSelect';
import { useToast } from '@/hooks/use-toast';

interface CreateFightProps {
  onFightCreated: () => void;
}

const CreateFight: React.FC<CreateFightProps> = ({ onFightCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    opponentEmail: '',
    myAnimal: '',
    opponentAnimal: ''
  });
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.myAnimal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    console.log('Creating fight:', formData);
    toast({
      title: "Fight Registered! 🥊",
      description: "Your conflict has been submitted and awaits resolution.",
    });
    
    setFormData({
      title: '',
      description: '',
      opponentEmail: '',
      myAnimal: '',
      opponentAnimal: ''
    });
    setStep(1);
    onFightCreated();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🥊</span>
            <span>Register Your Fight</span>
          </CardTitle>
          <p className="text-gray-600">Choose your animal persona and describe the conflict</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Fight Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Disagreement over project deadline"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Describe the Conflict *</Label>
                  <Textarea
                    id="description"
                    placeholder="Explain what the fight is about..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="opponentEmail">Opponent's Email (Optional)</Label>
                  <Input
                    id="opponentEmail"
                    type="email"
                    placeholder="opponent@example.com"
                    value={formData.opponentEmail}
                    onChange={(e) => setFormData({ ...formData, opponentEmail: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Choose Your Animal Persona
                </Button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Choose Your Animal Persona *</Label>
                  <p className="text-sm text-gray-600 mb-4">This represents how you approach conflicts</p>
                  <AnimalSelect
                    selectedAnimal={formData.myAnimal}
                    onAnimalSelect={(animal) => setFormData({ ...formData, myAnimal: animal })}
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!formData.myAnimal}
                  >
                    Register Fight 🥊
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFight;
