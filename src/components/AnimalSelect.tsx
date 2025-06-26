
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Animal {
  id: string;
  name: string;
  emoji: string;
  traits: string;
}

const animals: Animal[] = [
  { id: 'lion', name: 'Lion', emoji: '🦁', traits: 'Bold and fierce' },
  { id: 'owl', name: 'Owl', emoji: '🦉', traits: 'Wise and thoughtful' },
  { id: 'fox', name: 'Fox', emoji: '🦊', traits: 'Clever and cunning' },
  { id: 'bear', name: 'Bear', emoji: '🐻', traits: 'Strong and protective' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', traits: 'Quick and cautious' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', traits: 'Gentle giant' },
  { id: 'wolf', name: 'Wolf', emoji: '🐺', traits: 'Loyal pack leader' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅', traits: 'Sharp and focused' },
  { id: 'tiger', name: 'Tiger', emoji: '🐅', traits: 'Fierce hunter' },
  { id: 'shark', name: 'Shark', emoji: '🦈', traits: 'Relentless predator' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', traits: 'Mythical power' },
  { id: 'snake', name: 'Snake', emoji: '🐍', traits: 'Cunning strategist' },
  { id: 'gorilla', name: 'Gorilla', emoji: '🦍', traits: 'Raw strength' },
  { id: 'cheetah', name: 'Cheetah', emoji: '🐆', traits: 'Lightning fast' },
  { id: 'rhino', name: 'Rhino', emoji: '🦏', traits: 'Unstoppable force' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙', traits: 'Multi-tasker' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', traits: 'Intelligent navigator' },
  { id: 'turtle', name: 'Turtle', emoji: '🐢', traits: 'Patient wisdom' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧', traits: 'Cool under pressure' },
  { id: 'flamingo', name: 'Flamingo', emoji: '🦩', traits: 'Graceful balance' },
];

interface AnimalSelectProps {
  selectedAnimal: string;
  onAnimalSelect: (animalId: string) => void;
}

const AnimalSelect: React.FC<AnimalSelectProps> = ({ selectedAnimal, onAnimalSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
      {animals.map((animal) => (
        <Card 
          key={animal.id}
          className={`cursor-pointer transition-all hover:scale-105 ${
            selectedAnimal === animal.id 
              ? 'ring-2 ring-green-500 bg-green-50' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onAnimalSelect(animal.id)}
        >
          <CardContent className="p-3 text-center">
            <div className="text-2xl mb-1">{animal.emoji}</div>
            <h3 className="font-semibold text-xs">{animal.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{animal.traits}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnimalSelect;
