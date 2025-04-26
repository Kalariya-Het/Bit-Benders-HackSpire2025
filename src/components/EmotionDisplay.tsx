
import React from 'react';
import { cn } from '@/lib/utils';

type Emotion = 'happy' | 'sad' | 'neutral' | 'stressed' | 'calm' | 'excited' | 'tired' | null;

interface EmotionDisplayProps {
  emotion: Emotion;
  confirmed: boolean;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ 
  emotion, 
  confirmed 
}) => {
  if (!emotion) return null;

  const emotionConfigs = {
    happy: {
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      icon: '😊',
      pulseColor: 'bg-amber-500'
    },
    sad: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: '😔',
      pulseColor: 'bg-blue-500'
    },
    neutral: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: '😐',
      pulseColor: 'bg-gray-400'
    },
    stressed: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '😰',
      pulseColor: 'bg-red-500'
    },
    calm: {
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-800',
      icon: '😌',
      pulseColor: 'bg-teal-500'
    },
    excited: {
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      icon: '😃',
      pulseColor: 'bg-purple-500'
    },
    tired: {
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
      icon: '😴',
      pulseColor: 'bg-indigo-500'
    }
  };

  const config = emotionConfigs[emotion];

  return (
    <div className="relative animate-fade-in flex flex-col items-center">
      <div 
        className={cn(
          "emotion-bubble flex items-center gap-2",
          config.bgColor,
          config.textColor,
          confirmed ? "scale-100" : "scale-95 opacity-80"
        )}
      >
        <span className="text-xl">{config.icon}</span>
        <span className="capitalize">{emotion}</span>
      </div>
      
      {confirmed && (
        <div className="mt-4 relative">
          <div 
            className={`w-6 h-6 rounded-full ${config.pulseColor} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-gentle opacity-30`} 
            style={{ animationDelay: "0.3s" }}
          />
          <div 
            className={`w-12 h-12 rounded-full ${config.pulseColor} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-gentle opacity-20`}
            style={{ animationDelay: "0.6s" }}
          />
          <div 
            className={`w-20 h-20 rounded-full ${config.pulseColor} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-gentle opacity-10`}
            style={{ animationDelay: "0.9s" }}
          />
        </div>
      )}
    </div>
  );
};

export default EmotionDisplay;
