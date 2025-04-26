import { useState, useEffect, useCallback, useRef } from 'react';

// Define the necessary interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onaudiostart?: () => void;
  onspeechend?: () => void;
  onnomatch?: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type SpeechRecognitionHook = {
  transcript: string;
  isListening: boolean;
  startListening: (lang?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  hasUserSpoken: boolean;
  confidenceScore: number;
  isSpeechSupported: boolean;
};

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [hasUserSpoken, setHasUserSpoken] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  // Use refs to prevent duplicate recognitions
  const lastTranscriptRef = useRef('');
  const silenceTimerRef = useRef<number | null>(null);
  const processingRef = useRef(false);
  const transcriptBufferRef = useRef<Map<string, number>>(new Map());
  const languageRef = useRef('en-US');

  // Enhanced duplicate detection with Levenshtein distance
  const isDuplicate = useCallback((text1: string, text2: string): boolean => {
    // If the texts are identical or one contains the other
    if (text1 === text2 || text1.includes(text2) || text2.includes(text1)) {
      return true;
    }

    // Simple Levenshtein distance calculation for near-duplicates
    const leven = (s1: string, s2: string): number => {
      if (s1.length === 0) return s2.length;
      if (s2.length === 0) return s1.length;

      const matrix = Array(s1.length + 1).fill(null).map(() => 
        Array(s2.length + 1).fill(null)
      );

      for (let i = 0; i <= s1.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;

      for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }

      return matrix[s1.length][s2.length];
    };

    const maxLength = Math.max(text1.length, text2.length);
    if (maxLength === 0) return true;
    
    // Consider texts similar enough if their Levenshtein distance
    // is less than 20% of the longer text's length
    const distance = leven(text1.toLowerCase(), text2.toLowerCase());
    return distance / maxLength < 0.2;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      setIsSpeechSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = languageRef.current;

    let finalTranscript = '';

    recognitionInstance.onresult = (event) => {
      // Reset silence timer whenever we get a result
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      let interimTranscript = '';
      let highestConfidence = 0;

      // Process results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result[0].confidence > highestConfidence) {
          highestConfidence = result[0].confidence;
        }
        
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          
          // Check if it's a duplicate against recent transcripts
          let isDuplicated = false;
          
          // Check against our buffer of recent transcripts
          for (const [recentText, _] of transcriptBufferRef.current.entries()) {
            if (isDuplicate(text, recentText)) {
              isDuplicated = true;
              break;
            }
          }
          
          if (!isDuplicated) {
            finalTranscript += ' ' + text;
            
            // Add to buffer with timestamp
            transcriptBufferRef.current.set(text, Date.now());
            
            // Keep buffer size manageable
            if (transcriptBufferRef.current.size > 10) {
              const oldestKey = Array.from(transcriptBufferRef.current.entries())
                .sort((a, b) => a[1] - b[1])[0][0];
              transcriptBufferRef.current.delete(oldestKey);
            }
            
            setHasUserSpoken(true);
          }
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Only update if we have new content and confidence is high enough
      const newTranscript = (finalTranscript + ' ' + interimTranscript).trim();
      
      if (newTranscript !== lastTranscriptRef.current && highestConfidence > 0.6) {
        lastTranscriptRef.current = newTranscript;
        setTranscript(newTranscript);
        setConfidenceScore(highestConfidence);
        
        // Set a silence detection timer
        silenceTimerRef.current = window.setTimeout(() => {
          console.log("Detected silence after speech");
          setHasUserSpoken(true);
        }, 2000); // 2 seconds of silence considered as "done speaking"
      }
    };

    recognitionInstance.onerror = (event) => {
      // Don't report "no-speech" as an error, it's common and confusing to users
      if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
      
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
    };

    recognitionInstance.onend = () => {
      if (isListening && !processingRef.current) {
        console.log("Recognition ended, restarting...");
        try {
          setTimeout(() => {
            recognitionInstance.start();
          }, 100);
        } catch (err) {
          console.error("Failed to restart recognition:", err);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionInstance.onspeechend = () => {
      console.log("Speech ended");
      // Set a flag that user has spoken and finished
      setHasUserSpoken(true);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const startListening = useCallback((lang?: string) => {
    setError(null);
    setHasUserSpoken(false);
    processingRef.current = false;
    lastTranscriptRef.current = '';
    
    if (lang) {
      languageRef.current = lang;
      if (recognition) {
        recognition.lang = lang;
      }
    }
    
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
        console.log("Started listening in language:", languageRef.current);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      processingRef.current = true;
      recognition.stop();
      setIsListening(false);
      console.log("Stopped listening");
      
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    lastTranscriptRef.current = '';
    setHasUserSpoken(false);
    setConfidenceScore(0);
    
    // Clear the buffer when resetting
    transcriptBufferRef.current.clear();
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    hasUserSpoken,
    confidenceScore,
    isSpeechSupported
  };
}

export default useSpeechRecognition;
