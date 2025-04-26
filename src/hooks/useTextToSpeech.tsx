import { useState, useCallback, useRef, useEffect } from 'react';

type VoiceType = 'sage' | 'calm' | 'cheerful' | 'serious' | 'default';
type LanguageCode = 'en-US' | 'hi-IN' | 'es-ES' | 'fr-FR' | 'de-DE' | 'ja-JP' | 'zh-CN';

type TextToSpeechHook = {
  speak: (text: string, voiceType?: VoiceType, languageCode?: LanguageCode) => void;
  cancel: () => void;
  speaking: boolean;
  error: string | null;
  voiceType: VoiceType;
  setVoiceType: (type: VoiceType) => void;
  languageCode: LanguageCode;
  setLanguageCode: (code: LanguageCode) => void;
  availableVoices: SpeechSynthesisVoice[];
};

export function useTextToSpeech(): TextToSpeechHook {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voiceType, setVoiceType] = useState<VoiceType>('sage');
  const [languageCode, setLanguageCode] = useState<LanguageCode>('en-US');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const voicesLoadedRef = useRef(false);
  const speechQueueRef = useRef<{text: string, voiceType: VoiceType, langCode: LanguageCode}[]>([]);
  const isSpeakingRef = useRef(false);

  // Define cancel function first so it can be used elsewhere
  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, []);

  // Load and cache available voices
  const loadVoices = useCallback(() => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        voicesLoadedRef.current = true;
        return voices;
      }
    }
    return [];
  }, []);

  // Initialize voices when available
  useEffect(() => {
    if (window.speechSynthesis) {
      // Load voices immediately if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        voicesLoadedRef.current = true;
      }

      // Also set up the event listener for when voices change
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        voicesLoadedRef.current = true;
      };
    }

    // Reset and handle interrupted speech synthesis
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && speaking) {
        cancel();
      } else if (document.visibilityState === 'visible' && speechQueueRef.current.length > 0 && !isSpeakingRef.current) {
        const nextSpeech = speechQueueRef.current.shift();
        if (nextSpeech) {
          processSpeech(nextSpeech.text, nextSpeech.voiceType, nextSpeech.langCode);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Chrome and some browsers require periodic resume of speechSynthesis
    const resumeSpeechSynthesis = () => {
      if (window.speechSynthesis && speaking) {
        window.speechSynthesis.resume();
      }
    };

    const resumeInterval = setInterval(resumeSpeechSynthesis, 10000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(resumeInterval);
    };
  }, [speaking, cancel]);

  // Find the best matching voice based on type and language
  const findVoice = useCallback((voiceType: VoiceType, langCode: LanguageCode): SpeechSynthesisVoice | null => {
    let voices = availableVoices.length > 0 ? availableVoices : loadVoices();
    
    if (voices.length === 0) return null;

    // Filter for the requested language
    const langVoices = voices.filter(voice => voice.lang.includes(langCode.split('-')[0]));
    
    // If no voices for requested language, fall back to English
    const targetVoices = langVoices.length > 0 ? langVoices : voices.filter(v => v.lang.includes('en'));
    
    // Voice selection based on type
    switch (voiceType) {
      case 'sage':
        // Look for voices that sound wise and calm
        return targetVoices.find(v => 
          v.name.includes('Daniel') || 
          v.name.includes('Google UK English Male') || 
          v.name.includes('Male') && v.name.includes('US')
        ) || targetVoices[0];
      
      case 'calm':
        return targetVoices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Google UK English Female') || 
          v.name.includes('Female') && v.name.includes('US')
        ) || targetVoices[0];
      
      case 'cheerful':
        return targetVoices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Karen') || 
          v.name.includes('Female') && v.name.includes('Australian')
        ) || targetVoices[0];
      
      case 'serious':
        return targetVoices.find(v => 
          v.name.includes('Daniel') || 
          v.name.includes('Alex') || 
          v.name.includes('Male') && v.name.includes('UK')
        ) || targetVoices[0];
      
      default:
        // Default voice
        return targetVoices[0];
    }
  }, [availableVoices, loadVoices]);

  // Process speech - internal function
  const processSpeech = useCallback((text: string, type: VoiceType, langCode: LanguageCode) => {
    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    cancel();
    setError(null);
    
    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on type and language
    const voice = findVoice(type, langCode);
    if (voice) {
      newUtterance.voice = voice;
      newUtterance.lang = langCode;
    } else {
      console.warn("No suitable voice found for", type, langCode);
    }
    
    // Adjust parameters based on voice type
    switch (type) {
      case 'sage':
        newUtterance.rate = 0.9;
        newUtterance.pitch = 0.9;
        break;
      case 'calm':
        newUtterance.rate = 0.85;
        newUtterance.pitch = 1.0;
        break;
      case 'cheerful':
        newUtterance.rate = 1.1;
        newUtterance.pitch = 1.2;
        break;
      case 'serious':
        newUtterance.rate = 0.95;
        newUtterance.pitch = 0.8;
        break;
      default:
        newUtterance.rate = 1;
        newUtterance.pitch = 1;
    }
    
    newUtterance.volume = 1;

    newUtterance.onstart = () => {
      setSpeaking(true);
      isSpeakingRef.current = true;
    };
    
    newUtterance.onend = () => {
      setSpeaking(false);
      isSpeakingRef.current = false;
      
      // Check if there's more in the queue
      if (speechQueueRef.current.length > 0) {
        const nextSpeech = speechQueueRef.current.shift();
        if (nextSpeech) {
          setTimeout(() => {
            processSpeech(nextSpeech.text, nextSpeech.voiceType, nextSpeech.langCode);
          }, 300); // Small pause between speeches
        }
      }
    };
    
    newUtterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      if (event.error === 'interrupted') {
        // If interrupted, try to add to queue for later
        speechQueueRef.current.push({text, voiceType: type, langCode});
      } else {
        setError(`Speech synthesis error: ${event.error}`);
      }
      setSpeaking(false);
      isSpeakingRef.current = false;
    };

    setUtterance(newUtterance);
    
    try {
      window.speechSynthesis.speak(newUtterance);
    } catch (e) {
      setError(`Failed to speak: ${e}`);
      isSpeakingRef.current = false;
    }
  }, [cancel, findVoice]);

  // Public speak function
  const speak = useCallback((text: string, type?: VoiceType, langCode?: LanguageCode) => {
    const voiceToUse = type || voiceType;
    const langToUse = langCode || languageCode;
    
    if (speaking) {
      // If already speaking, queue this speech
      speechQueueRef.current.push({text, voiceType: voiceToUse, langCode: langToUse});
    } else {
      // Otherwise start speaking immediately
      processSpeech(text, voiceToUse, langToUse);
    }
  }, [voiceType, languageCode, speaking, processSpeech]);

  return {
    speak,
    cancel,
    speaking,
    error,
    voiceType,
    setVoiceType,
    languageCode,
    setLanguageCode,
    availableVoices
  };
}

export default useTextToSpeech;
