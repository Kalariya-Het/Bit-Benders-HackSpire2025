
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Bell, MessageCircle, Mic } from 'lucide-react';

interface ModeSelectorProps {
  onSelectMode: (mode: 'check-in' | 'emergency' | 'conversation') => void;
  className?: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode, className = '' }) => {
  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <h2 className="text-lg font-medium text-mosaic-800 mb-1 text-center">How can I help today?</h2>
      
      <Button 
        onClick={() => onSelectMode('check-in')}
        className="bg-mosaic-600 hover:bg-mosaic-700 text-white flex gap-2 items-center py-6"
      >
        <Heart className="h-5 w-5" />
        Emotional Check-in
        <span className="text-xs opacity-80 ml-1">(How are you feeling?)</span>
      </Button>
      
      <Button 
        onClick={() => onSelectMode('conversation')}
        variant="outline"
        className="bg-white/70 hover:bg-white/90 text-mosaic-700 flex gap-2 items-center py-6"
      >
        <MessageCircle className="h-5 w-5" />
        Free Conversation
        <span className="text-xs opacity-80 ml-1">(Just chat with Mike)</span>
      </Button>
      
      <Button 
        onClick={() => onSelectMode('emergency')}
        variant="destructive"
        className="flex gap-2 items-center py-6"
      >
        <Bell className="h-5 w-5" />
        Emergency Help
        <span className="text-xs opacity-80 ml-1">(Contact emergency support)</span>
      </Button>
    </div>
  );
};

export default ModeSelector;
