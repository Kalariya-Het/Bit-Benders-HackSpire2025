
import { Emotion } from '../types/voice-types';

// Enhanced emotion detection with weighted scoring and NLP techniques
export function analyzeSentiment(text: string): {
  dominantEmotion: Emotion;
  confidenceScore: number;
} {
  const normalizedText = text.toLowerCase();
  
  // Deep emotional analysis with weighted scoring
  let scores = {
    happy: 0,
    sad: 0,
    stressed: 0,
    calm: 0,
    excited: 0,
    tired: 0,
    neutral: 0
  };

  // Strong emotional indicators (high weights)
  const emotionKeywords = {
    happy: [
      {word: 'happy', weight: 2}, 
      {word: 'joy', weight: 2}, 
      {word: 'great', weight: 1.5}, 
      {word: 'wonderful', weight: 1.5}, 
      {word: 'excellent', weight: 1.5}, 
      {word: 'amazing', weight: 1.5}, 
      {word: 'excited', weight: 1.5}, 
      {word: 'love', weight: 1.5}, 
      {word: 'fantastic', weight: 1.5}
    ],
    sad: [
      {word: 'sad', weight: 2}, 
      {word: 'upset', weight: 1.8}, 
      {word: 'depressed', weight: 2}, 
      {word: 'down', weight: 1.5}, 
      {word: 'miserable', weight: 2}, 
      {word: 'unhappy', weight: 1.8}, 
      {word: 'hurt', weight: 1.5}, 
      {word: 'pain', weight: 1.5}, 
      {word: 'disappointed', weight: 1.5}
    ],
    stressed: [
      {word: 'stress', weight: 2}, 
      {word: 'anxious', weight: 2}, 
      {word: 'worried', weight: 1.8}, 
      {word: 'overwhelmed', weight: 2}, 
      {word: 'pressure', weight: 1.5}, 
      {word: 'tense', weight: 1.5}, 
      {word: 'nervous', weight: 1.5}, 
      {word: 'panic', weight: 1.8}, 
      {word: 'fear', weight: 1.5}
    ],
    calm: [
      {word: 'calm', weight: 2}, 
      {word: 'peaceful', weight: 2}, 
      {word: 'relaxed', weight: 2}, 
      {word: 'serene', weight: 1.8}, 
      {word: 'tranquil', weight: 1.8}, 
      {word: 'content', weight: 1.5}, 
      {word: 'balanced', weight: 1.5}, 
      {word: 'steady', weight: 1.5}, 
      {word: 'ease', weight: 1.5}
    ],
    excited: [
      {word: 'excited', weight: 2}, 
      {word: 'thrilled', weight: 2}, 
      {word: 'eager', weight: 1.5}, 
      {word: 'enthusiastic', weight: 1.8}, 
      {word: 'pumped', weight: 1.5}, 
      {word: 'psyched', weight: 1.5}, 
      {word: 'looking forward', weight: 1.5}, 
      {word: 'cant wait', weight: 1.5}
    ],
    tired: [
      {word: 'tired', weight: 2}, 
      {word: 'exhausted', weight: 2}, 
      {word: 'sleepy', weight: 1.8}, 
      {word: 'fatigue', weight: 1.8}, 
      {word: 'drained', weight: 1.8}, 
      {word: 'weary', weight: 1.5}, 
      {word: 'low energy', weight: 1.5}, 
      {word: 'need rest', weight: 1.5}
    ]
  };

  // Score direct emotional words with their weights
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach(({word, weight}) => {
      if (normalizedText.includes(word)) {
        scores[emotion as keyof typeof scores] += weight;
      }
    });
  });
  
  // Score sentence structure patterns
  const patterns = [
    { regex: /feeling good|feel good|i am good|i'm good|doing well/, emotion: 'happy', weight: 1 },
    { regex: /feeling bad|feel bad|i am bad|i'm bad|not doing well/, emotion: 'sad', weight: 1 },
    { regex: /too much|can['']t handle|stressed out|freaking out/, emotion: 'stressed', weight: 1.2 },
    { regex: /at peace|at ease|very calm|relaxed|chilling/, emotion: 'calm', weight: 1 },
    { regex: /can['']t wait|looking forward|excited about|hyped|stoked/, emotion: 'excited', weight: 1 },
    { regex: /need sleep|no energy|exhausted|so tired|need rest/, emotion: 'tired', weight: 1 }
  ];
  
  patterns.forEach(({regex, emotion, weight}) => {
    if (regex.test(normalizedText)) {
      scores[emotion as keyof typeof scores] += weight;
    }
  });
  
  // Detect negations with more nuance
  const negationPatterns = [
    { regex: /not happy|not feeling happy|don['']t feel happy|isn['']t happy/, target: 'happy', adjustment: -1.5 },
    { regex: /not sad|not feeling sad|don['']t feel sad|isn['']t sad/, target: 'sad', adjustment: -1.5 },
    { regex: /not stressed|not feeling stressed|don['']t feel stressed/, target: 'stressed', adjustment: -1.5 },
    { regex: /not calm|not feeling calm|don['']t feel calm/, target: 'calm', adjustment: -1.5 },
    { regex: /not excited|not feeling excited|don['']t feel excited/, target: 'excited', adjustment: -1.5 },
    { regex: /not tired|not feeling tired|don['']t feel tired/, target: 'tired', adjustment: -1.5 }
  ];
  
  negationPatterns.forEach(({regex, target, adjustment}) => {
    if (regex.test(normalizedText)) {
      scores[target as keyof typeof scores] += adjustment;
    }
  });
  
  // Check for neutral indicators with context
  if (/fine|ok|okay|alright|doing ok|not bad|not good/.test(normalizedText) && 
      !(/(really|very|so) (good|great|bad|terrible)/.test(normalizedText))) {
    scores.neutral += 1.2;
  }
  
  // If no strong emotions detected, lean toward neutral
  const totalScore = Object.values(scores).reduce((sum, score) => sum + Math.max(0, score), 0);
  if (totalScore < 1.2) scores.neutral = 1.2;

  // Find dominant emotion and calculate confidence
  const sortedEmotions = Object.entries(scores)
    .map(([emotion, score]) => ({ emotion, score }))
    .sort((a, b) => b.score - a.score);

  const dominant = sortedEmotions[0];
  
  // Calculate confidence based on difference between top emotions
  let confidence = 0.5; // Default confidence
  if (sortedEmotions.length > 1) {
    // Calculate ratio between top emotion and second emotion
    const topScore = Math.max(dominant.score, 0.1); // Avoid division by zero
    const secondScore = Math.max(sortedEmotions[1].score, 0.1);
    
    // Higher difference = higher confidence
    confidence = Math.min(0.95, 0.5 + (topScore - secondScore) / topScore * 0.5);
    
    // Higher absolute score also increases confidence
    confidence = Math.min(0.95, confidence + Math.min(0.3, topScore * 0.1));
  }

  return {
    dominantEmotion: dominant.score > 0 ? dominant.emotion as Emotion : 'neutral',
    confidenceScore: confidence
  };
}

export function getEmotionResponse(emotion: Emotion): string {
  const responses = {
    happy: [
      "You sound joyful! That's wonderful to hear.",
      "I can hear the happiness in your voice. That's great!",
      "You seem to be in good spirits today!",
      "Your positive energy is coming through clearly."
    ],
    sad: [
      "I hear that you might be feeling down.",
      "You sound a bit sad. Would you like to talk about it?",
      "I'm sensing some sadness in your voice.",
      "It sounds like today might be a bit tough for you."
    ],
    stressed: [
      "I sense some tension in your voice.",
      "You sound like you might be under some pressure.",
      "I can tell things might be stressful for you right now.",
      "You seem to have a lot on your mind."
    ],
    calm: [
      "You sound peaceful and centered.",
      "I'm picking up on a sense of calmness in your voice.",
      "You seem to be in a peaceful state of mind.",
      "There's a tranquil quality to your voice right now."
    ],
    excited: [
      "You sound really enthusiastic!",
      "I can hear the excitement in your voice!",
      "You seem energized about something!",
      "Your excitement is coming through loud and clear!"
    ],
    tired: [
      "You sound like you could use some rest.",
      "I notice you might be feeling tired.",
      "Your voice suggests you might be low on energy.",
      "You seem a bit fatigued right now."
    ],
    neutral: [
      "Thanks for sharing. I'd like to understand more about how you're feeling.",
      "I appreciate you talking with me. How else are you feeling?",
      "I'm listening. Could you tell me more about your mood?",
      "I'm here to chat. Would you like to share more about how you're day is going?"
    ]
  };

  const emotionKey = emotion || 'neutral';
  const responseArray = responses[emotionKey as keyof typeof responses];
  return responseArray[Math.floor(Math.random() * responseArray.length)];
}

export function getExampleForEmotion(emotion: Emotion): string {
  const examples = {
    happy: "For example, you could say 'I'm feeling great today because I got a promotion at work!'",
    sad: "For example, you might say 'I'm feeling down today because I miss my friends.'",
    stressed: "For example, you could say 'I'm feeling overwhelmed with all the deadlines this week.'",
    calm: "For example, you might say 'I'm feeling peaceful after my meditation session.'",
    excited: "For example, you could say 'I'm so excited about my upcoming vacation!'",
    tired: "For example, you might say 'I'm exhausted after working late all week.'",
    neutral: "For example, you could say 'I'm feeling okay, just a regular day.'"
  };

  return examples[emotion || 'neutral'];
}
