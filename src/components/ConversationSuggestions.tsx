
import React from 'react';

interface ConversationSuggestionsProps {
  question: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const ConversationSuggestions: React.FC<ConversationSuggestionsProps> = ({
  question,
  suggestions,
  onSuggestionClick
}) => {
  if (!question || suggestions.length === 0) return null;
  
  return (
    <div className="w-full mt-3 mb-2">
      <p className="text-xs text-mosaic-500 mb-1.5">Examples you could say:</p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs bg-mosaic-100 hover:bg-mosaic-200 text-mosaic-700 px-2 py-1 rounded-full transition-colors"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationSuggestions;
