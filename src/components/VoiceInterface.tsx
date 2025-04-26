
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Music, Book, HeartHandshake, Zap, Share, MessageCircle, Bell } from 'lucide-react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useTextToSpeech from '@/hooks/useTextToSpeech';
import WaveVisualizer from './WaveVisualizer';
import EmotionDisplay from './EmotionDisplay';
import ContentSuggestion from './ContentSuggestion';
import CommunityTipDisplay from './CommunityTipDisplay';
import LanguageSelector from './LanguageSelector';
import EmergencyContact from './EmergencyContact';
import ConversationSuggestions from './ConversationSuggestions';
import ModeSelector from './ModeSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { analyzeSentiment, getEmotionResponse, getExampleForEmotion } from '@/utils/sentimentAnalysis';
import { getRecommendation, getContentSpecificPrompt } from '@/utils/contentRecommendation';
import { addCommunityTip, getRandomTip } from '@/utils/communityFeatures';
import { 
  ConversationState, 
  Emotion, 
  ContentType, 
  LanguagePreference,
  CommunityTip,
  UserPreferences,
  EmergencyContact as EmergencyContactType
} from '@/types/voice-types';

// Wakeword for activation
const WAKE_WORDS = ['hey mike', 'hey mic', 'hey mick', 'hi mike', 'hi mic', 'hello mike'];

// Conversation timing constants
const RESPONSE_PAUSE = 3000;  // Wait 3s after AI response before listening
const USER_RESPONSE_TIMEOUT = 7000;  // Wait 7s for user to respond

// Mode types
type ConversationMode = 'check-in' | 'emergency' | 'conversation' | 'idle';

// Default user preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  emergencyContact: null,
  contentPreferences: {
    playlist: [],
    podcast: [],
    mindfulness: [],
    book: []
  },
  likedContent: {
    playlist: [],
    podcast: [],
    mindfulness: [],
    book: []
  },
  dislikedContent: {
    playlist: [],
    podcast: [],
    mindfulness: [],
    book: []
  }
};

// Generate example responses based on conversation state and emotion
const getResponseSuggestions = (state: ConversationState, emotion?: Emotion | null): string[] => {
  switch(state) {
    case 'listening':
      return [
        "I'm feeling a bit down today",
        "I'm actually really happy right now",
        "I'm stressed about work",
        "I'm feeling tired but okay"
      ];
    case 'emotion-check':
      return [
        "Yes, that's right",
        "No, I'm actually feeling different",
        "That's partially correct",
        "I'm not sure how I feel"
      ];
    case 'suggestion':
      return [
        "I'd like a playlist recommendation",
        "Do you have any book suggestions?",
        "Share something from the community",
        "I need some mindfulness exercises"
      ];
    case 'language-selection':
      return [
        "English please",
        "Hindi",
        "Spanish",
        "French"
      ];
    case 'community-sharing':
      return [
        "I'd like to hear what others shared",
        "Here's what helps me when I'm feeling this way...",
        "I don't have anything to share right now",
        "Play a community tip"
      ];
    case 'emergency-check':
      return [
        "Yes, please get me help",
        "No, I'm okay",
        "I just need someone to talk to",
        "Cancel emergency mode"
      ];
    default:
      return [];
  }
};

const VoiceInterface: React.FC = () => {
  // Core conversation state
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [conversationMode, setConversationMode] = useState<ConversationMode>('idle');
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion>(null);
  const [isEmotionConfirmed, setIsEmotionConfirmed] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [history, setHistory] = useState<{type: 'user' | 'assistant', text: string}[]>([]);
  const [responseSuggestions, setResponseSuggestions] = useState<string[]>([]);
  
  // Content and feature states
  const [selectedContent, setSelectedContent] = useState<ContentType>(null);
  const [contentRecommendation, setContentRecommendation] = useState('');
  const [selectedLanguagePreference, setSelectedLanguagePreference] = useState<LanguagePreference>('en');
  const [communityTip, setCommunityTip] = useState<CommunityTip | null>(null);
  const [isShowingEmergencyContact, setIsShowingEmergencyContact] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false);
  
  // References for timers and state management
  const responseTimerRef = useRef<number | null>(null);
  const userResponseTimerRef = useRef<number | null>(null);
  const previousRecommendationsRef = useRef<string[]>([]);
  const sharedTipRef = useRef<string | null>(null);
  const waitingForClarificationRef = useRef(false);

  // Hooks
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
    hasUserSpoken,
    confidenceScore
  } = useSpeechRecognition();

  const { 
    speak, 
    cancel, 
    speaking, 
    error: speechSynthesisError,
    voiceType,
    setVoiceType,
    languageCode,
    setLanguageCode 
  } = useTextToSpeech();
  
  const { toast } = useToast();
  
  // Handle language preference changes
  useEffect(() => {
    // Map language preference to language code for speech
    const languageMap: Record<LanguagePreference, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'ja': 'ja-JP',
      'zh': 'zh-CN'
    };
    
    setLanguageCode(languageMap[selectedLanguagePreference] as any);
    setUserPreferences(prev => ({
      ...prev,
      language: selectedLanguagePreference
    }));
  }, [selectedLanguagePreference]);
  
  // Update response suggestions when conversation state changes
  useEffect(() => {
    const suggestions = getResponseSuggestions(conversationState, detectedEmotion);
    setResponseSuggestions(suggestions);
  }, [conversationState, detectedEmotion]);
  
  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
      if (userResponseTimerRef.current) window.clearTimeout(userResponseTimerRef.current);
    };
  }, []);
  
  // Handle conversation based on user transcript
  useEffect(() => {
    if (!isListening) return;
    
    // Check for wake words when in idle state
    if (conversationState === 'idle') {
      const normalizedTranscript = transcript.toLowerCase().trim();
      
      for (const wakeWord of WAKE_WORDS) {
        if (normalizedTranscript.includes(wakeWord)) {
          handleWakeWordDetected();
          break;
        }
      }
    }
    
    // Handle user spoken in listening state with sufficient content
    if (conversationState === 'listening' && 
        hasUserSpoken && 
        transcript.trim().length > 5 &&
        confidenceScore > 0.6) {
      console.log("User has spoken enough content with confidence:", confidenceScore);
      processUserResponse();
    }
    
    // Handle emotion check responses
    if (conversationState === 'emotion-check' && hasUserSpoken) {
      const normalizedResponse = transcript.toLowerCase();
      
      if (normalizedResponse.includes('yes') || 
          normalizedResponse.includes('right') || 
          normalizedResponse.includes('correct') ||
          normalizedResponse.includes('that\'s it')) {
        setIsEmotionConfirmed(true);
        offerSuggestions();
      } else if (normalizedResponse.includes('no') || 
                 normalizedResponse.includes('not right') || 
                 normalizedResponse.includes('incorrect') ||
                 normalizedResponse.includes('wrong')) {
        askForCorrectEmotion();
      } else if (transcript.trim().length > 5) {
        // If user is giving a longer response, process it as a new emotional statement
        processUserResponse();
      }
    }
    
    // Handle language selection
    if (conversationState === 'language-selection' && hasUserSpoken) {
      const normalizedResponse = transcript.toLowerCase();
      let detectedLanguage: LanguagePreference = 'en';
      
      if (normalizedResponse.includes('hindi') || 
          normalizedResponse.includes('हिंदी')) {
        detectedLanguage = 'hi';
      } else if (normalizedResponse.includes('spanish') || 
                normalizedResponse.includes('español')) {
        detectedLanguage = 'es';
      } else if (normalizedResponse.includes('french') || 
                normalizedResponse.includes('français')) {
        detectedLanguage = 'fr';
      } else if (normalizedResponse.includes('german') || 
                normalizedResponse.includes('deutsch')) {
        detectedLanguage = 'de';
      } else if (normalizedResponse.includes('japanese') || 
                normalizedResponse.includes('日本語')) {
        detectedLanguage = 'ja';
      } else if (normalizedResponse.includes('chinese') || 
                normalizedResponse.includes('中文')) {
        detectedLanguage = 'zh';
      } else {
        detectedLanguage = 'en'; // Default to English
      }
      
      setSelectedLanguagePreference(detectedLanguage);
      handleLanguageSelected(detectedLanguage);
    }
    
    // Handle content suggestion responses
    if (conversationState === 'suggestion' && hasUserSpoken) {
      const normalizedResponse = transcript.toLowerCase();
      
      // Check for specific content requests
      if (normalizedResponse.includes('play') || normalizedResponse.includes('recommend')) {
        // Common music related keywords
        if (normalizedResponse.includes('song') || 
            normalizedResponse.includes('music') || 
            normalizedResponse.includes('playlist') ||
            normalizedResponse.includes('track') ||
            normalizedResponse.includes('melody')) {
          setSelectedContent('playlist');
          askForLanguagePreference();
          return;
        }
        
        // Common podcast keywords
        if (normalizedResponse.includes('podcast') || 
            normalizedResponse.includes('show') || 
            normalizedResponse.includes('episode') ||
            normalizedResponse.includes('talk')) {
          setSelectedContent('podcast');
          askForLanguagePreference();
          return;
        }
        
        // Common mindfulness keywords
        if (normalizedResponse.includes('mindful') || 
            normalizedResponse.includes('meditation') || 
            normalizedResponse.includes('breath') ||
            normalizedResponse.includes('relax') ||
            normalizedResponse.includes('calm')) {
          setSelectedContent('mindfulness');
          askForLanguagePreference();
          return;
        }
        
        // Common book keywords
        if (normalizedResponse.includes('book') || 
            normalizedResponse.includes('read') || 
            normalizedResponse.includes('novel') ||
            normalizedResponse.includes('story')) {
          setSelectedContent('book');
          askForLanguagePreference();
          return;
        }
        
        // If just asked to "play something", clarify what type
        if (normalizedResponse.includes('play') || normalizedResponse.includes('recommend')) {
          askForContentClarification();
          return;
        }
      }
      
      // General content type mentions
      if (normalizedResponse.includes('playlist') || normalizedResponse.includes('music')) {
        setSelectedContent('playlist');
        askForLanguagePreference();
      } else if (normalizedResponse.includes('podcast') || normalizedResponse.includes('funny')) {
        setSelectedContent('podcast');
        askForLanguagePreference();
      } else if (normalizedResponse.includes('mindful') || normalizedResponse.includes('exercise')) {
        setSelectedContent('mindfulness');
        askForLanguagePreference();
      } else if (normalizedResponse.includes('book') || normalizedResponse.includes('read')) {
        setSelectedContent('book');
        askForLanguagePreference();
      } else if (normalizedResponse.includes('community') || normalizedResponse.includes('tips') || 
                normalizedResponse.includes('tribe')) {
        handleCommunityFeatureRequest();
      } else if (normalizedResponse.includes('emergency') || normalizedResponse.includes('help now') || 
                normalizedResponse.includes('need help')) {
        handleEmergencyRequest();
      }
    }
    
    // Handle community sharing feature
    if (conversationState === 'community-sharing' && hasUserSpoken) {
      const normalizedResponse = transcript.toLowerCase();
      
      if (normalizedResponse.includes('hear') || 
          normalizedResponse.includes('listen') || 
          normalizedResponse.includes('play') || 
          normalizedResponse.includes('others')) {
        playRandomCommunityTip();
      } else if (transcript.trim().length > 5 && !waitingForClarificationRef.current) {
        shareCommunityTip(transcript.trim());
      }
    }
    
    // Handle emergency requests
    if (conversationState === 'emergency-check' && hasUserSpoken) {
      const normalizedResponse = transcript.toLowerCase();
      
      if (normalizedResponse.includes('yes') || normalizedResponse.includes('please') || 
          normalizedResponse.includes('help')) {
        triggerEmergencyContact();
      } else if (normalizedResponse.includes('no') || normalizedResponse.includes('cancel') || 
                normalizedResponse.includes('fine')) {
        cancelEmergencyContact();
      }
    }
    
  }, [transcript, hasUserSpoken, conversationState, confidenceScore]);
  
  // Set a timer for user response
  useEffect(() => {
    if (conversationState === 'listening' || 
        conversationState === 'emotion-check' || 
        conversationState === 'suggestion' ||
        conversationState === 'language-selection' ||
        conversationState === 'community-sharing' ||
        conversationState === 'emergency-check') {
      
      setWaitingForUserResponse(true);
      
      if (userResponseTimerRef.current) {
        window.clearTimeout(userResponseTimerRef.current);
      }
      
      userResponseTimerRef.current = window.setTimeout(() => {
        if (!hasUserSpoken) {
          console.log("User response timeout reached");
          handleNoResponse();
        }
        setWaitingForUserResponse(false);
      }, USER_RESPONSE_TIMEOUT);
    }
    
    return () => {
      if (userResponseTimerRef.current) {
        window.clearTimeout(userResponseTimerRef.current);
      }
    };
  }, [conversationState, hasUserSpoken]);
  
  // Handle when user doesn't respond
  const handleNoResponse = () => {
    switch (conversationState) {
      case 'listening':
        const promptMessage = `I didn't catch that. Could you tell me a bit more about how you're feeling? For example, you could say "${getExampleForEmotion('neutral')}"`;
        setCurrentMessage(promptMessage);
        speakWithVoiceType(promptMessage, 'calm');
        addToHistory('assistant', promptMessage);
        resetTranscript();
        startListening();
        break;
        
      case 'emotion-check':
        setIsEmotionConfirmed(true); // Assume detection was correct
        offerSuggestions();
        break;
        
      case 'language-selection':
        // Default to current language preference
        handleLanguageSelected(selectedLanguagePreference);
        break;
        
      case 'suggestion':
        // Provide a gentle reminder
        const reminderMessage = "Would you like a playlist, podcast, book recommendation, or a mindfulness exercise? Or maybe something from the community?";
        setCurrentMessage(reminderMessage);
        speakWithVoiceType(reminderMessage, 'cheerful');
        addToHistory('assistant', reminderMessage);
        
        // Listen again
        if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
        responseTimerRef.current = window.setTimeout(() => {
          resetTranscript();
          startListening();
        }, RESPONSE_PAUSE);
        break;
        
      case 'community-sharing':
        // Cancel sharing if no response
        const cancelMessage = "No worries, we won't share anything. Let's continue our conversation. Would you like a recommendation instead?";
        setCurrentMessage(cancelMessage);
        speakWithVoiceType(cancelMessage, 'calm');
        addToHistory('assistant', cancelMessage);
        
        // Return to suggestion state
        if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
        responseTimerRef.current = window.setTimeout(() => {
          setConversationState('suggestion');
          resetTranscript();
          startListening();
        }, RESPONSE_PAUSE);
        break;
        
      case 'emergency-check':
        // Cancel emergency if no confirmation
        cancelEmergencyContact();
        break;
        
      default:
        break;
    }
  };
  
  // Ask for clarification on content type when user request is ambiguous
  const askForContentClarification = () => {
    waitingForClarificationRef.current = true;
    
    const clarificationPrompt = "I'd be happy to recommend something. Would you prefer music, a podcast, a book, or a mindfulness exercise?";
    setCurrentMessage(clarificationPrompt);
    speakWithVoiceType(clarificationPrompt, 'cheerful');
    addToHistory('assistant', clarificationPrompt);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
      
      // Reset clarification flag after a delay
      setTimeout(() => {
        waitingForClarificationRef.current = false;
      }, 10000);
    }, RESPONSE_PAUSE);
  };
  
  useEffect(() => {
    if (speechError) {
      toast({
        title: "Speech Recognition Error",
        description: speechError,
        variant: "destructive"
      });
    }
    
    if (speechSynthesisError) {
      toast({
        title: "Text-to-Speech Error",
        description: speechSynthesisError,
        variant: "destructive"
      });
    }
  }, [speechError, speechSynthesisError, toast]);
  
  // Helper function to speak with appropriate voice type
  const speakWithVoiceType = useCallback((text: string, type = 'sage') => {
    // Set voice type based on emotion if needed
    let voiceToUse = type;
    if (detectedEmotion && isEmotionConfirmed && type === 'sage') {
      if (detectedEmotion === 'happy' || detectedEmotion === 'excited') {
        voiceToUse = 'cheerful';
      } else if (detectedEmotion === 'sad' || detectedEmotion === 'tired') {
        voiceToUse = 'calm';
      } else if (detectedEmotion === 'stressed') {
        voiceToUse = 'calm';
      }
    }
    
    setVoiceType(voiceToUse as any);
    speak(text);
  }, [speak, setVoiceType, detectedEmotion, isEmotionConfirmed]);
  
  // Wake word detection handler
  const handleWakeWordDetected = () => {
    stopListening();
    resetTranscript();
    setConversationState('greeting');
    
    const greeting = getRandomGreeting();
    setCurrentMessage(greeting);
    speakWithVoiceType(greeting);
    addToHistory('assistant', greeting);
    
    // Set timer to start listening after speaking
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      setConversationState('listening');
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  const getRandomGreeting = () => {
    const greetings = [
      "Hi there! How's your heart feeling today?",
      "Hey! I'm Mike. How are you doing right now?",
      "Hello! I'd love to hear how you're feeling today.",
      "Hey, it's Mike here. How's your day going?",
      "Hi! I'm here to listen. How are you feeling?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };
  
  // Process user's emotional response
  const processUserResponse = useCallback(() => {
    if (!transcript.trim()) return;
    
    setConversationState('processing');
    stopListening();
    
    const userMessage = transcript.trim();
    addToHistory('user', userMessage);
    
    // Enhanced sentiment analysis from our utility
    const { dominantEmotion, confidenceScore } = analyzeSentiment(userMessage);
    setDetectedEmotion(dominantEmotion);
    
    // Process response after a short delay to simulate thinking
    setTimeout(() => {
      // Generate emotional response based on detected emotion
      const response = getEmotionResponse(dominantEmotion);
      const followUp = " Would you like to tell me more about how you're feeling?";
      
      setCurrentMessage(response + followUp);
      speakWithVoiceType(response, dominantEmotion === 'happy' ? 'cheerful' : 'sage');
      addToHistory('assistant', response);
      
      // After speaking the response, speak the follow-up
      setTimeout(() => {
        speakWithVoiceType(followUp);
        addToHistory('assistant', followUp);
        
        // Move to emotion confirmation after pause
        if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
        responseTimerRef.current = window.setTimeout(() => {
          confirmEmotion(dominantEmotion);
        }, RESPONSE_PAUSE);
      }, 2000);
    }, 1000);
  }, [transcript, speakWithVoiceType, startListening, stopListening]);
  
  // Confirm the detected emotion
  const confirmEmotion = (emotion: Emotion) => {
    setConversationState('emotion-check');
    const confirmationQuestion = `It sounds like you're feeling ${emotion}. Did I get that right?`;
    setCurrentMessage(confirmationQuestion);
    speakWithVoiceType(confirmationQuestion);
    addToHistory('assistant', confirmationQuestion);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  // Ask for correct emotion if Mike was wrong
  const askForCorrectEmotion = () => {
    const question = "I'm sorry I misunderstood. Could you tell me more directly how you're feeling? For example, 'I'm feeling anxious' or 'I'm actually quite happy'";
    setCurrentMessage(question);
    speakWithVoiceType(question, 'calm');
    addToHistory('assistant', question);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      setConversationState('listening');
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  // Ask for language preference before offering content
  const askForLanguagePreference = () => {
    setConversationState('language-selection');
    
    let languagePrompt = `What language would you prefer for your ${selectedContent}? English, Hindi, Spanish, or something else?`;
    
    setCurrentMessage(languagePrompt);
    speakWithVoiceType(languagePrompt);
    addToHistory('assistant', languagePrompt);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  // Handle language selection
  const handleLanguageSelected = (language: LanguagePreference) => {
    if (selectedContent) {
      const contentPrompt = getContentSpecificPrompt(selectedContent, language);
      
      setCurrentMessage(contentPrompt);
      speakWithVoiceType(contentPrompt);
      addToHistory('assistant', contentPrompt);
      
      // Wait briefly and then provide a recommendation
      setTimeout(() => {
        provideContentRecommendation(selectedContent, language);
      }, 1000);
    } else {
      // No content selected, go back to suggestions
      offerSuggestions();
    }
  };
  
  // Offer content suggestions based on mood
  const offerSuggestions = () => {
    setConversationState('suggestion');
    
    let suggestion = "I've got a few ideas to lift your spirits. Would you like to hear a funny podcast, a calming playlist, a quick mindful exercise, or connect with the Voice Tribe community?";
    
    if (detectedEmotion === 'happy' || detectedEmotion === 'excited') {
      suggestion = "Since you're feeling good, would you like an upbeat playlist, an inspiring podcast, a book recommendation, or would you like to share a tip with the Voice Tribe community?";
    } else if (detectedEmotion === 'sad') {
      suggestion = "I've got some mood-lifting suggestions. Would you prefer a cheerful playlist, an uplifting podcast, a gentle mindfulness exercise, or would you like to hear what helps others in the Voice Tribe?";
    } else if (detectedEmotion === 'stressed') {
      suggestion = "To help with stress, I can suggest a calming playlist, a relaxation exercise, a lighthearted podcast, or connect you with emergency help if needed. What would you prefer?";
    } else if (detectedEmotion === 'calm') {
      suggestion = "To maintain your calm state, would you like a peaceful playlist, a mindfulness practice, a book recommendation, or would you like to share your calm techniques with the Voice Tribe?";
    } else if (detectedEmotion === 'tired') {
      suggestion = "For those tired moments, I can recommend a gentle energizing playlist, a short rejuvenating exercise, a podcast to keep you company, or would you like to hear what helps others with fatigue?";
    }
    
    setCurrentMessage(suggestion);
    speakWithVoiceType(suggestion);
    addToHistory('assistant', suggestion);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  // Provide content recommendation based on selection
  const provideContentRecommendation = (contentType: ContentType, language: LanguagePreference = 'en') => {
    setConversationState('content-selection');
    stopListening();
    
    // Get a recommendation based on emotion, content type and language
    const recommendation = getRecommendation(
      contentType,
      detectedEmotion || 'neutral',
      language,
      previousRecommendationsRef.current
    );
    
    // Add to previous recommendations to avoid repetition
    previousRecommendationsRef.current = [...previousRecommendationsRef.current, recommendation];
    if (previousRecommendationsRef.current.length > 10) {
      previousRecommendationsRef.current = previousRecommendationsRef.current.slice(-10);
    }
    
    setContentRecommendation(recommendation);
    setCurrentMessage(recommendation);
    speakWithVoiceType(recommendation);
    addToHistory('assistant', recommendation);
    
    // After recommendation, ask if they'd like to try something else
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      const followUp = `Would you like to try something else instead?`;
      setCurrentMessage(recommendation + " " + followUp);
      speakWithVoiceType(followUp);
      addToHistory('assistant', followUp);
      
      // Reset for another suggestion if needed
      setTimeout(() => {
        setConversationState('suggestion');
        resetTranscript();
        startListening();
      }, RESPONSE_PAUSE);
    }, 4000);
  };
  
  // Handle request for community features
  const handleCommunityFeatureRequest = () => {
    setConversationState('community-sharing');
    
    const communityPrompt = "Would you like to share a tip with the Voice Tribe community or hear what others have shared?";
    setCurrentMessage(communityPrompt);
    speakWithVoiceType(communityPrompt);
    addToHistory('assistant', communityPrompt);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
      
      // Check what the user wants to do with community features
      userResponseTimerRef.current = window.setTimeout(() => {
        if (hasUserSpoken) {
          const normalizedResponse = transcript.toLowerCase();
          
          if (normalizedResponse.includes('share') || 
              normalizedResponse.includes('tip') || 
              normalizedResponse.includes('tell')) {
            // User wants to share a tip
            promptForCommunityTip();
          } else if (normalizedResponse.includes('hear') || 
                    normalizedResponse.includes('listen') || 
                    normalizedResponse.includes('others')) {
            // User wants to hear tips from others
            playRandomCommunityTip();
          } else {
            // Default to sharing a tip
            promptForCommunityTip();
          }
        } else {
          // If no response, default to playing a community tip
          playRandomCommunityTip();
        }
      }, RESPONSE_PAUSE);
    }, RESPONSE_PAUSE);
  };
  
  // Prompt user to share a community tip
  const promptForCommunityTip = () => {
    setConversationState('community-sharing');
    resetTranscript();
    
    const sharePrompt = "Please share a brief tip that might help others feeling similar to you. What works for you when you're feeling " + 
      (detectedEmotion || "this way") + "?";
      
    setCurrentMessage(sharePrompt);
    speakWithVoiceType(sharePrompt);
    addToHistory('assistant', sharePrompt);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  // Share a tip with the community
  const shareCommunityTip = (tipText: string) => {
    stopListening();
    
    // Store the community tip
    const newTip = addCommunityTip(
      tipText, 
      detectedEmotion || 'neutral', 
      selectedLanguagePreference
    );
    
    setCommunityTip(newTip);
    sharedTipRef.current = tipText;
    
    const confirmation = "Thank you for sharing your tip with the Voice Tribe community! It may help others who are feeling similar.";
    setCurrentMessage(confirmation);
    speakWithVoiceType(confirmation, 'cheerful');
    addToHistory('assistant', confirmation);
    
    // After a pause, return to suggestions
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      offerSuggestions();
    }, RESPONSE_PAUSE);
  };
  
  // Play a random tip from the community
  const playRandomCommunityTip = () => {
    stopListening();
    
    // Get a random tip
    const tip = getRandomTip(selectedLanguagePreference, detectedEmotion);
    setCommunityTip(tip);
    
    let message = "";
    if (tip) {
      message = `Here's a tip from the Voice Tribe community: "${tip.text}"`;
    } else {
      message = "There aren't any community tips yet. Would you like to be the first to share one?";
    }
    
    setCurrentMessage(message);
    speakWithVoiceType(message);
    addToHistory('assistant', message);
    
    // After a pause, return to suggestions
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      offerSuggestions();
    }, RESPONSE_PAUSE + 2000); // Slightly longer pause after playing a tip
  };
  
  // Handle emergency help request
  const handleEmergencyRequest = () => {
    stopListening();
    setConversationMode('emergency');
    setConversationState('emergency-check');
    
    const contactName = userPreferences.emergencyContact?.name || "your emergency contact";
    
    const emergencyPrompt = `I sense you might need urgent help. Should I alert ${contactName} and share your location?`;
    setCurrentMessage(emergencyPrompt);
    speakWithVoiceType(emergencyPrompt, 'serious');
    addToHistory('assistant', emergencyPrompt);
    
    // Show emergency contact UI
    setIsShowingEmergencyContact(true);
    
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      resetTranscript();
      startListening();
    }, RESPONSE_PAUSE);
  };
  
  // Trigger emergency contact
  const triggerEmergencyContact = () => {
    stopListening();
    
    if (userPreferences.emergencyContact) {
      const message = `I'm alerting ${userPreferences.emergencyContact.name} now. They'll receive a notification with your current location.`;
      setCurrentMessage(message);
      speakWithVoiceType(message, 'serious');
      addToHistory('assistant', message);
    } else {
      const message = "You haven't set up an emergency contact yet. Would you like to do that now?";
      setCurrentMessage(message);
      speakWithVoiceType(message, 'serious');
      addToHistory('assistant', message);
    }
    
    // After a pause, return to suggestions
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      setIsShowingEmergencyContact(false);
      offerSuggestions();
    }, RESPONSE_PAUSE * 2); // Longer pause for emergency situation
  };
  
  // Cancel emergency contact
  const cancelEmergencyContact = () => {
    setIsShowingEmergencyContact(false);
    
    const message = "Okay, I won't alert anyone. Remember, I'm here to help whenever you need it. Let's continue our conversation.";
    setCurrentMessage(message);
    speakWithVoiceType(message, 'calm');
    addToHistory('assistant', message);
    
    // Return to suggestions after a pause
    if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
    responseTimerRef.current = window.setTimeout(() => {
      offerSuggestions();
    }, RESPONSE_PAUSE);
  };
  
  // Save emergency contact info
  const handleSaveEmergencyContact = (name: string, phone: string) => {
    const updatedPreferences = {
      ...userPreferences,
      emergencyContact: { name, phone }
    };
    
    setUserPreferences(updatedPreferences);
    
    const message = `I've saved ${name} as your emergency contact. If you ever need urgent help, just say "I need help now".`;
    setCurrentMessage(message);
    speakWithVoiceType(message, 'calm');
    addToHistory('assistant', message);
    
    // Hide the emergency contact form after saving
    setTimeout(() => {
      setIsShowingEmergencyContact(false);
    }, 3000);
  };
  
  const addToHistory = (type: 'user' | 'assistant', text: string) => {
    setHistory(prev => [...prev, {type, text}]);
  };

  // Handle mode selection
  const handleModeSelection = (mode: ConversationMode) => {
    setConversationMode(mode);
    
    switch(mode) {
      case 'check-in':
        // Start emotional check-in flow
        setConversationState('greeting');
        const greeting = "Hi there! I'm here to check in on how you're feeling today. Would you like to tell me about your emotional state?";
        setCurrentMessage(greeting);
        speakWithVoiceType(greeting);
        addToHistory('assistant', greeting);
        
        // Set timer to start listening after speaking
        if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
        responseTimerRef.current = window.setTimeout(() => {
          setConversationState('listening');
          resetTranscript();
          startListening();
        }, RESPONSE_PAUSE);
        break;
      
      case 'emergency':
        // Start emergency flow
        handleEmergencyRequest();
        break;
        
      case 'conversation':
        // Start free conversation
        setConversationState('greeting');
        const conversationGreeting = "I'm here to chat with you. What's on your mind today?";
        setCurrentMessage(conversationGreeting);
        speakWithVoiceType(conversationGreeting);
        addToHistory('assistant', conversationGreeting);
        
        // Set timer to start listening after speaking
        if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
        responseTimerRef.current = window.setTimeout(() => {
          setConversationState('listening');
          resetTranscript();
          startListening();
        }, RESPONSE_PAUSE);
        break;
        
      case 'idle':
      default:
        // Reset everything
        handleStopConversation();
        break;
    }
  };
  
  // Handle suggestion click from conversation suggestions component
  const handleSuggestionClick = (suggestion: string) => {
    // Simulate the user speaking this suggestion
    addToHistory('user', suggestion);
    
    // Process based on current conversation state
    switch(conversationState) {
      case 'emotion-check':
        if (suggestion.toLowerCase().includes('yes')) {
          setIsEmotionConfirmed(true);
          offerSuggestions();
        } else if (suggestion.toLowerCase().includes('no')) {
          askForCorrectEmotion();
        }
        break;
        
      case 'listening':
        // Process as emotional statement
        setConversationState('processing');
        const { dominantEmotion } = analyzeSentiment(suggestion);
        setDetectedEmotion(dominantEmotion);
        confirmEmotion(dominantEmotion);
        break;
        
      case 'suggestion':
        if (suggestion.toLowerCase().includes('playlist')) {
          setSelectedContent('playlist');
          askForLanguagePreference();
        } else if (suggestion.toLowerCase().includes('podcast')) {
          setSelectedContent('podcast');
          askForLanguagePreference();
        } else if (suggestion.toLowerCase().includes('book')) {
          setSelectedContent('book');
          askForLanguagePreference();
        } else if (suggestion.toLowerCase().includes('mindful')) {
          setSelectedContent('mindfulness');
          askForLanguagePreference();
        } else if (suggestion.toLowerCase().includes('community')) {
          handleCommunityFeatureRequest();
        }
        break;
        
      case 'language-selection':
        if (suggestion.toLowerCase().includes('english')) {
          setSelectedLanguagePreference('en');
          handleLanguageSelected('en');
        } else if (suggestion.toLowerCase().includes('hindi')) {
          setSelectedLanguagePreference('hi');
          handleLanguageSelected('hi');
        } else if (suggestion.toLowerCase().includes('spanish')) {
          setSelectedLanguagePreference('es');
          handleLanguageSelected('es');
        } else if (suggestion.toLowerCase().includes('french')) {
          setSelectedLanguagePreference('fr');
          handleLanguageSelected('fr');
        }
        break;
        
      default:
        break;
    }
  };
  
  const handleStartConversation = () => {
    if (conversationState === 'idle') {
      startListening();
      toast({
        title: "Listening for 'Hey Mike'",
        description: "Say 'Hey Mike' to start a conversation."
      });
    }
  };
  
  const handleStopConversation = () => {
    stopListening();
    cancel();
    setConversationState('idle');
    setConversationMode('idle');
    resetTranscript();
    setDetectedEmotion(null);
    setIsEmotionConfirmed(false);
    setSelectedContent(null);
    setContentRecommendation('');
    setIsShowingEmergencyContact(false);
    
    if (responseTimerRef.current) {
      window.clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    
    if (userResponseTimerRef.current) {
      window.clearTimeout(userResponseTimerRef.current);
      userResponseTimerRef.current = null;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4 space-y-8">
      <Card className="w-full p-6 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-mosaic-100/90 to-calm-100/90 shadow-lg border-mosaic-200">
        <h1 className="text-3xl font-bold text-mosaic-900 text-center">Mike</h1>
        
        {conversationState === 'idle' ? (
          <ModeSelector onSelectMode={handleModeSelection} />
        ) : (
          <div className="text-center">
            <p className="text-lg text-mosaic-800 mb-2">
              {currentMessage}
            </p>
            
            <ConversationSuggestions 
              question={currentMessage}
              suggestions={responseSuggestions}
              onSuggestionClick={handleSuggestionClick}
            />
            
            <LanguageSelector 
              selectedLanguage={selectedLanguagePreference}
              onSelectLanguage={setSelectedLanguagePreference}
            />
            
            {selectedContent && contentRecommendation && (
              <div className="mt-4 max-w-md mx-auto">
                <ContentSuggestion
                  contentType={selectedContent}
                  text={contentRecommendation}
                  emotion={detectedEmotion || 'neutral'}
                />
              </div>
            )}
            
            {isShowingEmergencyContact && (
              <div className="mt-4 max-w-md mx-auto">
                <EmergencyContact
                  name={userPreferences.emergencyContact?.name || ''}
                  phone={userPreferences.emergencyContact?.phone || ''}
                  onSave={handleSaveEmergencyContact}
                  onCancel={() => setIsShowingEmergencyContact(false)}
                />
              </div>
            )}
            
            {!selectedContent && !isShowingEmergencyContact && detectedEmotion && (
              <EmotionDisplay 
                emotion={detectedEmotion} 
                confirmed={isEmotionConfirmed} 
              />
            )}
            
            {communityTip && !selectedContent && !isShowingEmergencyContact && (
              <div className="mt-4 animate-fade-in max-w-md mx-auto">
                <CommunityTipDisplay tip={communityTip} />
              </div>
            )}
          </div>
        )}
        
        <WaveVisualizer 
          isActive={isListening || speaking} 
          size="md" 
        />
        
        <div className="flex gap-4">
          {conversationState === 'idle' ? (
            <Button
              variant="default"
              className="bg-mosaic-600 hover:bg-mosaic-700 text-white rounded-full px-8 py-6"
              onClick={handleStartConversation}
            >
              <Mic className="mr-2" size={20} />
              Activate Voice
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-white/50 hover:bg-white/70 text-mosaic-800 rounded-full px-8 py-6"
              onClick={handleStopConversation}
            >
              <MicOff className="mr-2" size={20} />
              End Conversation
            </Button>
          )}
        </div>
        
        {conversationState !== 'idle' && (
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 bg-white/50"
              onClick={() => {
                setSelectedContent('playlist');
                askForLanguagePreference();
              }}
            >
              <Music className="h-4 w-4" />
              Music
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 bg-white/50"
              onClick={() => {
                setSelectedContent('podcast');
                askForLanguagePreference();
              }}
            >
              <Zap className="h-4 w-4" />
              Podcast
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 bg-white/50"
              onClick={() => {
                setSelectedContent('mindfulness');
                askForLanguagePreference();
              }}
            >
              <HeartHandshake className="h-4 w-4" />
              Mindfulness
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 bg-white/50"
              onClick={() => {
                setSelectedContent('book');
                askForLanguagePreference();
              }}
            >
              <Book className="h-4 w-4" />
              Book
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 bg-white/50"
              onClick={handleCommunityFeatureRequest}
            >
              <Share className="h-4 w-4" />
              Community
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 bg-white/50"
              onClick={handleEmergencyRequest}
            >
              <Bell className="h-4 w-4" />
              Help
            </Button>
          </div>
        )}
        
        {isListening && (
          <p className="text-sm text-mosaic-700 animate-pulse">
            {waitingForUserResponse ? "Listening for your response..." : "Listening..."}
          </p>
        )}
        
        {speaking && (
          <p className="text-sm text-mosaic-700">Speaking...</p>
        )}
      </Card>
      
      {history.length > 0 && (
        <div className="w-full p-4 bg-white/50 rounded-lg shadow max-h-60 overflow-y-auto">
          <h2 className="text-lg font-medium text-mosaic-800 mb-2">Conversation</h2>
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  item.type === 'user' 
                    ? 'bg-calm-200 text-calm-900' 
                    : 'bg-mosaic-200 text-mosaic-900'
                }`}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {communityTip && (
        <div className="w-full">
          <h2 className="text-lg font-medium text-mosaic-800 mb-2">Community Voices</h2>
          <CommunityTipDisplay tip={communityTip} />
        </div>
      )}
    </div>
  );
};

export default VoiceInterface;
