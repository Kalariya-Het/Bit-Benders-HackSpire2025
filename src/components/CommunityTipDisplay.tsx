
import React from 'react';
import { CommunityTip } from '../types/voice-types';
import { formatTimeSince } from '../utils/communityFeatures';
import { getEmotionColor } from '../utils/contentRecommendation';
import { MessageCircle } from 'lucide-react';

interface CommunityTipDisplayProps {
  tip: CommunityTip | null;
  loading?: boolean;
}

const CommunityTipDisplay: React.FC<CommunityTipDisplayProps> = ({ tip, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full p-4 bg-white/50 rounded-lg shadow animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div className="w-3/4">
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!tip) {
    return (
      <div className="w-full p-4 bg-white/50 rounded-lg shadow text-center">
        <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-500">No community tips available yet. Be the first to share!</p>
      </div>
    );
  }

  const emotionColor = getEmotionColor(tip.emotion);
  
  return (
    <div className="w-full p-4 bg-white/60 rounded-lg shadow transition-all hover:bg-white/80">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${emotionColor}-100 text-${emotionColor}-600`}>
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-gray-800">{tip.text}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`px-2 py-1 rounded-full text-xs bg-${emotionColor}-100 text-${emotionColor}-600`}>
              {tip.emotion}
            </span>
            <span className="text-xs text-gray-500">{formatTimeSince(tip.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTipDisplay;
