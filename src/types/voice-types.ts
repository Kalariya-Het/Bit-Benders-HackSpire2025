
export type Emotion = 'happy' | 'sad' | 'neutral' | 'stressed' | 'calm' | 'excited' | 'tired' | null;
export type ContentType = 'playlist' | 'podcast' | 'mindfulness' | 'book' | null;
export type LanguagePreference = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
export type ConversationState = 
  'idle' | 
  'greeting' | 
  'listening' | 
  'processing' | 
  'responding' | 
  'emotion-check' |
  'suggestion' | 
  'language-selection' |
  'content-selection' |
  'community-sharing' |
  'community-listening' |
  'emergency-check';

export interface CommunityTip {
  id: string;
  text: string;
  emotion: Emotion;
  language: LanguagePreference;
  timestamp: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface UserPreferences {
  language: LanguagePreference;
  emergencyContact: EmergencyContact | null;
  contentPreferences: {
    [key in ContentType]: string[];
  };
  likedContent: {
    [key in ContentType]: string[];
  };
  dislikedContent: {
    [key in ContentType]: string[];
  };
}
