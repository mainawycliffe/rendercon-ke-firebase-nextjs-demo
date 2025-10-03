'use client';

import { ExclamationTriangleIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}

export default function VoiceInput({ onTranscript, onVoiceStart, onVoiceEnd }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('SpeechRecognition API not available');
        setIsSupported(false);
        setErrorMessage('Voice recognition is not supported in this browser.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        // Get user's preferred language and create fallback list
        const browserLang = navigator.language || 'en-US';
        const supportedLanguages = [browserLang, 'en-US', 'en', 'en-GB'];

        // Remove duplicates and set primary language
        const uniqueLanguages = [...new Set(supportedLanguages)];
        recognition.lang = uniqueLanguages[0];

        console.log(`Initializing speech recognition with language: ${recognition.lang}`);
        console.log(`Fallback languages available: ${uniqueLanguages.slice(1).join(', ')}`);

        recognition.onstart = () => {
          setIsListening(true);
          onVoiceStart?.();
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPart = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptPart;
            } else {
              interimTranscript += transcriptPart;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          setTranscript(currentTranscript);

          if (finalTranscript) {
            onTranscript(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);

          // Handle specific error cases
          if (event.error === 'language-not-supported') {
            console.warn(`Language ${recognition.lang} not supported, trying fallback languages...`);
            setErrorMessage('Language not supported, trying alternatives...');

            // Try fallback languages
            const fallbackLangs = ['en-US', 'en', 'en-GB'];
            let langIndex = 0;

            const tryNextLanguage = () => {
              if (langIndex < fallbackLangs.length) {
                recognition.lang = fallbackLangs[langIndex];
                langIndex++;
                console.log(`Trying language: ${recognition.lang}`);

                try {
                  recognition.start();
                  setErrorMessage('');
                  return;
                } catch (error) {
                  console.error(`Failed to start with ${recognition.lang}:`, error);
                  tryNextLanguage();
                }
              } else {
                console.error('All fallback languages failed');
                setErrorMessage('Voice recognition not available for your language');
                setIsSupported(false);
              }
            };

            tryNextLanguage();
          } else if (event.error === 'not-allowed') {
            console.error('Microphone access denied');
            setErrorMessage('Microphone access denied. Please allow microphone access to use voice input.');
            setIsSupported(false);
          } else if (event.error === 'no-speech') {
            setErrorMessage('No speech detected. Please try again.');
          } else if (event.error === 'network') {
            setErrorMessage('Network error. Please check your connection.');
          } else {
            console.error('Other speech recognition error:', event.error);
            setErrorMessage(`Voice recognition error: ${event.error}`);
          }

          setIsListening(false);
          onVoiceEnd?.();
        };

        recognition.onend = () => {
          setIsListening(false);
          onVoiceEnd?.();
        };

        recognitionRef.current = recognition;
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
        setIsSupported(false);
        setErrorMessage('Failed to initialize voice recognition.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onVoiceStart, onVoiceEnd]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setErrorMessage('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setErrorMessage('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div
        className='text-center p-6 rounded-xl border flex flex-col items-center space-y-3'
        style={{
          backgroundColor: 'var(--surface-elevated)',
          borderColor: 'var(--warning)',
        }}>
        <div
          className='w-12 h-12 rounded-xl flex items-center justify-center'
          style={{ backgroundColor: 'var(--warning)' }}>
          <ExclamationTriangleIcon className='w-6 h-6 text-white' />
        </div>
        <div>
          <p className='font-medium mb-1' style={{ color: 'var(--text-primary)' }}>
            Voice input not supported
          </p>
          <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
            Please use text input instead. Voice recognition requires a modern browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center space-y-6 py-8'>
      {/* Voice Button */}
      <div className='relative'>
        <button
          onClick={isListening ? stopListening : startListening}
          className='relative p-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-xl'
          style={{
            backgroundColor: isListening ? 'var(--error)' : 'var(--primary)',
            color: 'white',
            boxShadow: isListening
              ? '0 20px 40px -12px rgba(220, 38, 38, 0.4)'
              : '0 20px 40px -12px rgba(37, 99, 235, 0.4)',
          }}>
          {isListening ? <StopIcon className='w-8 h-8' /> : <MicrophoneIcon className='w-8 h-8' />}
        </button>

        {/* Recording indicator pulses */}
        {isListening && (
          <>
            <div className='absolute inset-0 rounded-full animate-ping' style={{ backgroundColor: 'var(--error)' }} />
            <div
              className='absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse'
              style={{ backgroundColor: 'var(--error)' }}
            />
          </>
        )}
      </div>

      {/* Status Text */}
      <div className='text-center space-y-2'>
        <p className='text-lg font-semibold' style={{ color: isListening ? 'var(--error)' : 'var(--text-primary)' }}>
          {isListening ? 'Listening...' : 'Tap to speak'}
        </p>
        <p className='text-sm' style={{ color: 'var(--text-muted)' }}>
          {isListening
            ? 'Speak clearly and I&apos;ll transcribe your words'
            : 'Click the microphone and start speaking'}
        </p>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <div
          className='w-full max-w-md p-4 rounded-xl border transition-all duration-300'
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border)',
          }}>
          <div className='flex items-start gap-3'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1'
              style={{ backgroundColor: 'var(--primary-light)' }}>
              <MicrophoneIcon className='w-4 h-4' style={{ color: 'var(--primary)' }} />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium mb-1' style={{ color: 'var(--text-muted)' }}>
                Live transcript
              </p>
              <p className='text-sm leading-relaxed' style={{ color: 'var(--text-primary)' }}>
                &quot;{transcript}&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          className='w-full max-w-md p-4 rounded-xl border flex items-start gap-3'
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--error)',
            color: 'var(--error)',
          }}>
          <ExclamationTriangleIcon className='w-5 h-5 flex-shrink-0 mt-0.5' />
          <div>
            <p className='text-sm font-medium'>Voice Recognition Issue</p>
            <p className='text-xs mt-1 opacity-90'>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isListening && !transcript && (
        <div
          className='w-full max-w-md p-4 rounded-xl border text-center'
          style={{
            backgroundColor: 'var(--surface-elevated)',
            borderColor: 'var(--border-light)',
          }}>
          <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>
            💡 Tip: Speak naturally and clearly for better recognition
          </p>
        </div>
      )}
    </div>
  );
}

// Add type definitions for speech recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
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
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}
