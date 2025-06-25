
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
];

interface AnimalSelectProps {
  selectedAnimal: string;
  onAnimalSelect: (animalId: string) => void;
}

const AnimalSelect: React.FC<AnimalSelectProps> = ({ selectedAnimal, onAnimalSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">{animal.emoji}</div>
            <h3 className="font-semibold text-sm">{animal.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{animal.traits}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnimalSelect;
