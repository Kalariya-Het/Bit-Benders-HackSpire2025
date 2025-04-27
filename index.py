import pyttsx3
import speech_recognition as sr
import datetime
import webbrowser
import os
import wikipedia

# Initialize the TTS engine
engine = pyttsx3.init()

# Set the voice (Optional: you can tweak rate, volume, etc.)
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)  # 0 for male, 1 for female voice (depending on Mac voices)

def speak(text):
    """Speak the given text."""
    engine.say(text)
    engine.runAndWait()

def listen():
    """Listen for a command and return it as text."""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        r.pause_threshold = 1  # seconds of silence before considering phrase complete
        audio = r.listen(source)

    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language="en-in")
        print(f"You said: {query}\n")
    except Exception as e:
        print("Could not understand. Say that again, please...")
        return None
    return query

def wish_user():
    """Wish the user according to the time."""
    hour = int(datetime.datetime.now().hour)
    if 0 <= hour < 12:
        speak("Good Morning!")
    elif 12 <= hour < 18:
        speak("Good Afternoon!")
    else:
        speak("Good Evening!")
    speak("Hello, I am your assistant. How can I help you today?")

def run_assistant():
    wish_user()
    while True:
        query = listen()
        if query is None:
            continue

        query = query.lower()

        # Some basic commands
        if 'open youtube' in query:
            webbrowser.open("https://www.youtube.com")
            speak("Opening YouTube")

        elif 'open google' in query:
            webbrowser.open("https://www.google.com")
            speak("Opening Google")

        elif 'play music' in query:
            music_dir = '/Users/twisha/Music'  # change this to your music folder path
            songs = os.listdir(music_dir)
            if songs:
                os.system(f'open "{os.path.join(music_dir, songs[0])}"')
                speak("Playing music")
            else:
                speak("No songs found")

        elif 'time' in query:
            strTime = datetime.datetime.now().strftime("%H:%M:%S")
            speak(f"The time is {strTime}")

        elif 'exit' in query or 'stop' in query:
            speak("Goodbye! Have a great day!")
            break

        else:
            speak("Sorry, I didn't understand that. Can you say it again?")

if __name__ == "__main__":
    run_assistant()
