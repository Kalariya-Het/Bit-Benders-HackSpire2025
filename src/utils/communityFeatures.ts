import { CommunityTip, Emotion, LanguagePreference } from '../types/voice-types';

// In-memory storage for community tips (would be replaced by a database in production)
let communityTips: CommunityTip[] = [
  {
    id: '1',
    text: "Taking a 10-minute walk in nature helps me feel more balanced when I'm stressed.",
    emotion: 'stressed',
    language: 'en',
    timestamp: Date.now() - 86400000 // 1 day ago
  },
  {
    id: '2',
    text: "Playing my favorite upbeat songs while cooking turns a chore into a mood-lifting activity!",
    emotion: 'happy',
    language: 'en',
    timestamp: Date.now() - 43200000 // 12 hours ago
  },
  {
    id: '3',
    text: "When I'm feeling down, writing three things I'm grateful for helps shift my perspective.",
    emotion: 'sad',
    language: 'en',
    timestamp: Date.now() - 21600000 // 6 hours ago
  }
];

export function addCommunityTip(text: string, emotion: Emotion, language: LanguagePreference): CommunityTip {
  const newTip: CommunityTip = {
    id: Math.random().toString(36).substring(2, 15),
    text,
    emotion,
    language,
    timestamp: Date.now()
  };
  
  communityTips.push(newTip);
  
  // Keep the collection from growing too large (just for this demo)
  if (communityTips.length > 100) {
    communityTips = communityTips.slice(-100);
  }
  
  return newTip;
}

export function getRandomTip(language: LanguagePreference = 'en', emotion?: Emotion): CommunityTip | null {
  // Filter tips by language
  let eligibleTips = communityTips.filter(tip => tip.language === language);
  
  // If no tips in requested language, fall back to English
  if (eligibleTips.length === 0) {
    eligibleTips = communityTips.filter(tip => tip.language === 'en');
  }
  
  // Further filter by emotion if specified
  if (emotion) {
    const emotionTips = eligibleTips.filter(tip => tip.emotion === emotion);
    // If we have emotion-specific tips, use those, otherwise keep all language-filtered tips
    if (emotionTips.length > 0) {
      eligibleTips = emotionTips;
    }
  }
  
  if (eligibleTips.length === 0) return null;
  
  // Return a random tip
  return eligibleTips[Math.floor(Math.random() * eligibleTips.length)];
}

export function getRecentTips(limit: number = 5, language: LanguagePreference = 'en'): CommunityTip[] {
  // Filter by language
  let eligibleTips = communityTips.filter(tip => tip.language === language);
  
  // If no tips in requested language, fall back to English
  if (eligibleTips.length === 0) {
    eligibleTips = communityTips.filter(tip => tip.language === 'en');
  }
  
  // Sort by timestamp (most recent first) and return limited number
  return eligibleTips
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function formatTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  let interval = seconds / 31536000; // seconds in a year
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000; // seconds in a month
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400; // seconds in a day
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600; // seconds in an hour
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60; // seconds in a minute
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return Math.floor(seconds) + " seconds ago";
}
