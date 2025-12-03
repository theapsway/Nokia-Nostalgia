import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Direction } from '@/types/game';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onDirectionChange }) => {
  return (
    <div className="md:hidden mt-4">
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        <div />
        <Button
          variant="secondary"
          size="lg"
          className="aspect-square"
          onClick={() => onDirectionChange('UP')}
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
        <div />
        <Button
          variant="secondary"
          size="lg"
          className="aspect-square"
          onClick={() => onDirectionChange('LEFT')}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div />
        <Button
          variant="secondary"
          size="lg"
          className="aspect-square"
          onClick={() => onDirectionChange('RIGHT')}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
        <div />
        <Button
          variant="secondary"
          size="lg"
          className="aspect-square"
          onClick={() => onDirectionChange('DOWN')}
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
        <div />
      </div>
    </div>
  );
};

export default MobileControls;
