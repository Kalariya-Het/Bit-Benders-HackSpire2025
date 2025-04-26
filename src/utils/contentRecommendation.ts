
import { ContentType, Emotion, LanguagePreference } from '../types/voice-types';

// Content database by emotion and content type
const contentDatabase: {
  [key in Emotion]: {
    [key in ContentType]: {
      [key in LanguagePreference]?: string[];
    }
  }
} = {
  happy: {
    playlist: {
      en: [
        "Good Vibes on Spotify - upbeat tracks to match your positive mood",
        "Happy Dance Party on Spotify - energetic tunes to keep you moving",
        "Feel Good Classics - timeless hits that spread joy",
        "Sunshine Pop - bright and cheerful melodies"
      ],
      hi: [
        "Bollywood Party Hits on Spotify - high energy dance tracks",
        "Feelgood Hindi Songs - uplifting classics and new hits",
        "Happy Hindi Playlist - cheerful Bollywood favorites"
      ],
      es: [
        "Alegría Latina en Spotify - ritmos latinos que te harán bailar",
        "Éxitos Felices - canciones optimistas en español"
      ]
    },
    podcast: {
      en: [
        "The Happiness Lab with Dr. Laurie Santos - the science behind happiness",
        "Conan O'Brien Needs a Friend - hilarious conversations with celebrities",
        "SmartLess - comedy and fascinating interviews"
      ],
      hi: [
        "The Ranveer Show - inspiring stories and conversations",
        "Kahaani Express - entertaining stories in Hindi"
      ]
    },
    mindfulness: {
      en: [
        "Gratitude Meditation - take a moment to appreciate three things you're grateful for",
        "Joy Visualization - imagine your happiness expanding to fill the room around you",
        "Mindful Movement - gentle exercises to enhance your positive mood"
      ],
      hi: [
        "आभार ध्यान - अपनी खुशियों पर ध्यान केंद्रित करें",
        "प्रसन्नता ध्यान - सकारात्मक ऊर्जा पर ध्यान केंद्रित करें"
      ]
    },
    book: {
      en: [
        "The House in the Cerulean Sea by TJ Klune - a heartwarming fantasy",
        "Project Hail Mary by Andy Weir - an uplifting sci-fi adventure",
        "The Midnight Library by Matt Haig - an inspiring story about possibilities"
      ],
      hi: [
        "पंचतंत्र की कहानियां - मनोरंजक और ज्ञानवर्धक कहानियां",
        "मन के जीते जीत - स्वामी विवेकानंद द्वारा प्रेरक विचार"
      ]
    }
  },
  sad: {
    playlist: {
      en: [
        "Mood Boost on Spotify - gentle tunes to lift your spirits",
        "Cozy Acoustic Vibes - warm, comforting melodies",
        "Uplifting Classics - inspirational songs to brighten your day",
        "Nostalgic Favorites - familiar songs that bring comfort"
      ],
      hi: [
        "Soulful Hindi Ballads - emotional but uplifting songs",
        "Peaceful Hindi Melodies - calming tracks for reflection"
      ]
    },
    podcast: {
      en: [
        "Happier with Gretchen Rubin - practical advice for living a happier life",
        "TED Talks Daily - inspiring ideas worth spreading",
        "The School of Greatness - inspiring stories to lift your mood"
      ],
      hi: [
        "The Habit Coach - positive habits for better living",
        "Indian Noir - engaging storytelling to distract the mind"
      ]
    },
    mindfulness: {
      en: [
        "Loving-Kindness Meditation - send compassion to yourself and others for 5 minutes",
        "Body Scan for Emotional Release - notice where you might be holding tension",
        "Comfort Visualization - imagine being surrounded by warmth and support"
      ],
      hi: [
        "प्रेम-करुणा ध्यान - अपने आप को और दूसरों के लिए करुणा का अभ्यास करें",
        "शांति ध्यान - मन को शांत करने के लिए"
      ]
    },
    book: {
      en: [
        "The Boy, the Mole, the Fox and the Horse by Charlie Mackesy - simple yet profound comfort",
        "A Man Called Ove by Fredrik Backman - a touching story that will make you laugh and cry",
        "Where the Crawdads Sing by Delia Owens - beautiful and absorbing"
      ],
      hi: [
        "आनंदमठ - बंकिमचंद्र चट्टोपाध्याय की प्रेरक कहानी",
        "गोदान - प्रेमचंद का प्रसिद्ध उपन्यास"
      ]
    }
  },
  stressed: {
    playlist: {
      en: [
        "Calm & Relaxed on Spotify - gentle melodies to reduce stress",
        "Peaceful Piano - beautiful instrumental pieces for relaxation",
        "Nature Sounds - calming environmental audio",
        "Ambient Relaxation - low-key electronic music to unwind"
      ],
      hi: [
        "Classical Indian Ragas for Peace - traditional calming melodies",
        "Meditation Music in Hindi - soothing tracks for stress relief"
      ]
    },
    podcast: {
      en: [
        "Nothing Much Happens - bedtime stories for adults to calm the mind",
        "Ten Percent Happier - practical approaches to meditation",
        "The Daily Meditation Podcast - short guided meditations"
      ],
      hi: [
        "The Meditation Podcast in Hindi - guided relaxation practices",
        "Neend - sleep stories in Hindi to calm the mind"
      ]
    },
    mindfulness: {
      en: [
        "4-7-8 Breathing - inhale for 4 counts, hold for 7, exhale for 8, repeat 5 times",
        "Progressive Muscle Relaxation - tense and release each muscle group",
        "5-4-3-2-1 Grounding - notice 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, 1 thing you taste"
      ],
      hi: [
        "प्राणायाम अभ्यास - गहरी सांस लेने की तकनीक",
        "तनाव मुक्ति ध्यान - शरीर के प्रत्येक हिस्से को आराम देने का अभ्यास"
      ]
    },
    book: {
      en: [
        "Why Zebras Don't Get Ulcers by Robert Sapolsky - understanding and managing stress",
        "10% Happier by Dan Harris - a skeptic's journey to meditation",
        "Breath by James Nestor - transformative practices for breathing"
      ],
      hi: [
        "मन की शांति - योग और ध्यान पर पुस्तक",
        "तनाव मुक्त जीवन - आधुनिक जीवन में शांति के लिए मार्गदर्शिका"
      ]
    }
  },
  calm: {
    playlist: {
      en: [
        "Peaceful Piano on Spotify - beautiful instrumental pieces",
        "Ambient Chill - atmospheric soundscapes",
        "Acoustic Calm - gentle guitar melodies",
        "Morning Coffee - soft jazz and acoustic favorites"
      ],
      hi: [
        "शांत रागें - traditional peaceful ragas",
        "ध्यान संगीत - meditation music in Hindi traditions"
      ]
    },
    podcast: {
      en: [
        "On Being with Krista Tippett - thoughtful conversations on meaning",
        "Radio Headspace - bite-sized mindfulness",
        "Sleep With Me - the podcast that puts you to sleep"
      ],
      hi: [
        "ध्यान और योग - Hindi podcast on mindfulness practices",
        "कहानी सुनो - gentle storytelling in Hindi"
      ]
    },
    mindfulness: {
      en: [
        "Mindful Awareness Practice - observe your surroundings with full presence for 3 minutes",
        "Sky Gazing - focus on the vastness of the sky as a metaphor for your mind",
        "Mindful Walking - take a short walk with complete attention to each step"
      ],
      hi: [
        "साक्षी भाव अभ्यास - present moment awareness practice",
        "शून्य ध्यान - emptiness meditation for deeper calm"
      ]
    },
    book: {
      en: [
        "Wintering by Katherine May - a peaceful reflection on embracing life's quiet seasons",
        "The Book of Joy by Dalai Lama and Desmond Tutu - finding lasting happiness",
        "Stillness Is the Key by Ryan Holiday - achieving clarity and success through calm"
      ],
      hi: [
        "आनंद की ओर - spiritual journey in Hindi literature",
        "सादा जीवन उच्च विचार - simple living, high thinking guide"
      ]
    }
  },
  excited: {
    playlist: {
      en: [
        "Adrenaline Workout on Spotify - high energy tracks",
        "Power Hits - popular upbeat songs",
        "Dance Party Anthems - irresistible dance tracks",
        "Feel Good Indie - uplifting alternative music"
      ],
      hi: [
        "Bollywood Dance Hits - energetic dance numbers",
        "Party Anthems Hindi - celebration songs for high energy"
      ]
    },
    podcast: {
      en: [
        "How I Built This with Guy Raz - inspiring entrepreneurial stories",
        "The Tim Ferriss Show - tools and tactics from world-class performers",
        "TED Radio Hour - fascinating ideas and innovations"
      ],
      hi: [
        "Josh Talks Hindi - inspiring stories of achievers",
        "Umeed - stories of hope and inspiration in Hindi"
      ]
    },
    mindfulness: {
      en: [
        "Energy Channeling - direct your excitement into focused intention",
        "Mindful Productivity - harness your energy for purposeful action",
        "Gratitude Amplification - appreciate and enhance your positive feelings"
      ],
      hi: [
        "संकल्प शक्ति - focusing your energy with determination",
        "उत्साह ध्यान - channeling excitement into achievement"
      ]
    },
    book: {
      en: [
        "Atomic Habits by James Clear - transform your life with small changes",
        "Big Magic by Elizabeth Gilbert - embrace your creativity",
        "The Alchemist by Paulo Coelho - pursue your dreams"
      ],
      hi: [
        "जीत आपकी - motivational guide for success",
        "सपने सच होते हैं - inspirational stories in Hindi"
      ]
    }
  },
  tired: {
    playlist: {
      en: [
        "Afternoon Energy Boost on Spotify - uplifting but not overwhelming tracks",
        "Gentle Wake Up - soft music that gradually energizes",
        "Coffee Shop Tunes - pleasant background music",
        "Sunny Day Soundtrack - light and refreshing songs"
      ],
      hi: [
        "Refreshing Hindi Songs - uplifting but gentle tracks",
        "Morning Ragas - traditional energizing music"
      ]
    },
    podcast: {
      en: [
        "TED Talks Daily - bite-sized inspiration",
        "Short Wave - NPR's daily science podcast, 10-15 minutes long",
        "Planet Money - economics explained in an entertaining way"
      ],
      hi: [
        "Naan Stop Dhaba - short Hindi podcast episodes about food",
        "Tech Talks Hindi - interesting technology discussions"
      ]
    },
    mindfulness: {
      en: [
        "Energizing Breathwork - 10 quick, deep breaths followed by a long exhale",
        "Wake Up Body Scan - bring awareness and energy to each part of your body",
        "Revitalizing Visualization - imagine bright light filling you with energy"
      ],
      hi: [
        "प्राण ऊर्जा अभ्यास - energizing breath practice",
        "चैतन्य ध्यान - awakening meditation"
      ]
    },
    book: {
      en: [
        "Atomic Habits by James Clear - bite-sized, practical advice",
        "The Power of When by Michael Breus - work with your body's natural rhythms",
        "When by Daniel Pink - the scientific secrets of perfect timing"
      ],
      hi: [
        "जीवनी शक्ति - book about enhancing life force",
        "आरोग्य चिंतन - health and wellness guide in Hindi"
      ]
    }
  },
  neutral: {
    playlist: {
      en: [
        "Discover Weekly on Spotify - personalized recommendations",
        "Today's Top Hits - popular current songs",
        "Chill Hits - modern relaxed pop music",
        "Brain Food - focus-enhancing instrumental tracks"
      ],
      hi: [
        "New Bollywood Hits - latest popular Hindi songs",
        "Evergreen Hindi Classics - timeless Bollywood favorites"
      ]
    },
    podcast: {
      en: [
        "Stuff You Should Know - interesting topics explained",
        "Freakonomics Radio - surprising insights about everyday life",
        "Radiolab - fascinating stories about science and life"
      ],
      hi: [
        "Puliyabaazi - Hindi-Urdu podcast on politics and culture",
        "The Seen and the Unseen - Indian society and culture"
      ]
    },
    mindfulness: {
      en: [
        "Simple Body Scan Meditation - spend 5 minutes bringing awareness to each part of your body",
        "Mindful Breathing - focus on your breath for 5 minutes",
        "Open Awareness - notice sounds, sensations, and thoughts without judgment"
      ],
      hi: [
        "सामान्य ध्यान अभ्यास - basic meditation in Hindi",
        "श्वास पर ध्यान - breath focus exercise"
      ]
    },
    book: {
      en: [
        "Project Hail Mary by Andy Weir - engaging sci-fi adventure",
        "The Thursday Murder Club by Richard Osman - clever mystery with humor",
        "A Gentleman in Moscow by Amor Towles - beautifully written historical fiction"
      ],
      hi: [
        "नर्मदा परिक्रमा - travel memoir by Amrita Pritam",
        "मानस का हंस - popular Hindi literature"
      ]
    }
  }
};

// Function to get a recommendation based on user preferences
export function getRecommendation(
  contentType: ContentType,
  emotion: Emotion,
  language: LanguagePreference,
  previousRecommendations: string[] = []
): string {
  if (!contentType || !emotion) {
    return "I'm not sure what to recommend right now. Would you like to try something specific?";
  }
  
  const emotionDatabase = contentDatabase[emotion] || contentDatabase.neutral;
  const categoryOptions = emotionDatabase[contentType];
  
  if (!categoryOptions) {
    return `I don't have any ${contentType} recommendations at the moment. Would you like to try something else?`;
  }
  
  // Try to get recommendations in the preferred language
  let options = categoryOptions[language];
  
  // Fall back to English if no recommendations in the preferred language
  if (!options || options.length === 0) {
    options = categoryOptions.en;
  }
  
  // If still no options, return a generic message
  if (!options || options.length === 0) {
    return `I don't have any ${contentType} recommendations for you right now. Would you like to try something else?`;
  }
  
  // Filter out previous recommendations if possible
  let availableOptions = options.filter(option => !previousRecommendations.includes(option));
  
  // If all have been recommended before, reset and use all options
  if (availableOptions.length === 0) {
    availableOptions = options;
  }
  
  // Select a random option
  const randomIndex = Math.floor(Math.random() * availableOptions.length);
  return availableOptions[randomIndex];
}

export function getContentSpecificPrompt(contentType: ContentType, language: LanguagePreference): string {
  const prompts = {
    playlist: {
      en: "What kind of music do you enjoy? For example, pop, rock, jazz, or classical?",
      hi: "आप किस प्रकार का संगीत पसंद करते हैं? उदाहरण के लिए, पॉप, रॉक, जैज़, या क्लासिकल?",
      es: "¿Qué tipo de música te gusta? Por ejemplo, pop, rock, jazz o clásica?"
    },
    podcast: {
      en: "What subjects interest you? Perhaps comedy, news, stories, or education?",
      hi: "आपकी रुचि किन विषयों में है? शायद कॉमेडी, समाचार, कहानियाँ, या शिक्षा?",
      es: "¿Qué temas te interesan? ¿Comedia, noticias, historias o educación?"
    },
    book: {
      en: "What genres do you enjoy reading? Fiction, non-fiction, mystery, or self-help?",
      hi: "आप किस प्रकार की किताबें पढ़ना पसंद करते हैं? कल्पना, गैर-कल्पना, रहस्य, या आत्म-सहायता?",
      es: "¿Qué géneros te gusta leer? ¿Ficción, no ficción, misterio o autoayuda?"
    },
    mindfulness: {
      en: "Would you prefer a quick breathing exercise, meditation, or a gentle movement practice?",
      hi: "क्या आप एक त्वरित श्वास व्यायाम, ध्यान, या एक सौम्य आंदोलन अभ्यास पसंद करेंगे?",
      es: "¿Preferirías un ejercicio de respiración rápido, meditación o una práctica de movimiento suave?"
    }
  };

  return prompts[contentType]?.[language] || prompts[contentType]?.en || 
    "What specific type of content would you prefer?";
}

// For color selection based on emotion
export function getEmotionColor(emotion: Emotion): string {
  switch (emotion) {
    case 'happy': return 'amber';
    case 'sad': return 'blue';
    case 'stressed': return 'red';
    case 'calm': return 'teal';
    case 'excited': return 'purple';
    case 'tired': return 'indigo';
    default: return 'gray';
  }
}
