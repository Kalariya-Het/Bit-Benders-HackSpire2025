
import React from 'react';
import { Music, Zap, HeartHandshake, Book } from 'lucide-react';
import { ContentType, Emotion } from '../types/voice-types';
import { getEmotionColor } from '../utils/contentRecommendation';

interface ContentSuggestionProps {
  contentType: ContentType;
  text: string;
  emotion: Emotion;
}

const ContentSuggestion: React.FC<ContentSuggestionProps> = ({
  contentType,
  text,
  emotion
}) => {
  const emotionColor = getEmotionColor(emotion);
  
  const renderContentIcon = () => {
    const iconClass = `h-12 w-12 text-${emotionColor}-600`;
    
    switch (contentType) {
      case 'playlist':
        return <Music className={iconClass} />;
      case 'podcast':
        return <Zap className={iconClass} />;
      case 'mindfulness':
        return <HeartHandshake className={iconClass} />;
      case 'book':
        return <Book className={iconClass} />;
      default:
        return null;
    }
  };
  
  return (
    <div className={`p-4 rounded-lg bg-${emotionColor}-50 border border-${emotionColor}-200 animate-fade-in`}>
      <div className="flex flex-col items-center mb-3">
        {renderContentIcon()}
        <p className={`mt-2 text-sm font-medium text-${emotionColor}-700 capitalize`}>{contentType}</p>
      </div>
      <p className={`text-${emotionColor}-800 text-center`}>{text}</p>
    </div>
  );
};

export default ContentSuggestion;
