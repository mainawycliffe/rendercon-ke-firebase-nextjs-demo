'use client';

import { Message } from '@/types/conversation';
import { MicrophoneIcon, PaperAirplaneIcon, PencilIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import VoiceInput from './VoiceInput';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  currentImage?: string;
}

export default function ChatInterface({ messages, onSendMessage, isLoading, currentImage }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    };

    // Use setTimeout to ensure the DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceTranscript = (text: string) => {
    if (text && !isLoading) {
      onSendMessage(text);
      setIsVoiceMode(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Messages Area */}
      <div className='flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin'>
        {messages.length === 0 && (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div
              className='w-16 h-16 rounded-2xl flex items-center justify-center mb-4'
              style={{ backgroundColor: 'var(--surface-elevated)' }}>
              <svg
                className='w-8 h-8'
                style={{ color: 'var(--text-muted)' }}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
            </div>
            <p className='text-lg font-medium mb-2' style={{ color: 'var(--text-primary)' }}>
              {currentImage ? 'Ready to analyze your image' : 'Upload an image to get started'}
            </p>
            <p className='text-sm' style={{ color: 'var(--text-muted)' }}>
              {currentImage
                ? 'Ask me anything about what you see in the image'
                : "Share a photo and I'll help you understand what's in it"}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`
              max-w-[85%] rounded-2xl px-4 py-3 shadow-sm relative group
              ${message.role === 'user' ? 'ml-12' : 'mr-12'}
            `}
              style={{
                backgroundColor: message.role === 'user' ? 'var(--primary)' : 'var(--surface-elevated)',
                color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                border: message.role === 'assistant' ? '1px solid var(--border-light)' : 'none',
              }}>
              {/* Message content */}
              <p className='whitespace-pre-wrap leading-relaxed'>{message.content}</p>

              {/* Message metadata */}
              <div className='flex items-center justify-between mt-3 pt-2 border-t border-white/10 dark:border-slate-600/30'>
                <div className='text-xs opacity-70'>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Voice playback button for AI responses */}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => speakText(message.content)}
                    className='opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-slate-600/30'
                    title='Play audio'>
                    <SpeakerWaveIcon className='w-4 h-4' />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className='flex justify-start'>
            <div
              className='mr-12 rounded-2xl px-4 py-3 shadow-sm border'
              style={{
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--border-light)',
              }}>
              <div className='flex items-center space-x-3'>
                <div className='flex space-x-1'>
                  <div
                    className='w-2 h-2 rounded-full animate-bounce'
                    style={{ backgroundColor: 'var(--primary)' }}></div>
                  <div
                    className='w-2 h-2 rounded-full animate-bounce'
                    style={{ backgroundColor: 'var(--primary)', animationDelay: '0.1s' }}></div>
                  <div
                    className='w-2 h-2 rounded-full animate-bounce'
                    style={{ backgroundColor: 'var(--primary)', animationDelay: '0.2s' }}></div>
                </div>
                <span className='text-sm font-medium' style={{ color: 'var(--text-secondary)' }}>
                  Analyzing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className='h-1' />
      </div>

      {/* Input Area */}
      <div
        className='border-t p-6'
        style={{
          borderColor: 'var(--border-light)',
          backgroundColor: 'var(--surface)',
        }}>
        {/* Mode Toggle */}
        <div className='flex justify-center mb-6'>
          <div className='p-1 rounded-xl flex gap-1' style={{ backgroundColor: 'var(--surface-elevated)' }}>
            <button
              onClick={() => setIsVoiceMode(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                !isVoiceMode ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: !isVoiceMode ? 'var(--surface)' : 'transparent',
                color: !isVoiceMode ? 'var(--primary)' : 'var(--text-secondary)',
              }}>
              <PencilIcon className='w-4 h-4' />
              Type
            </button>
            <button
              onClick={() => setIsVoiceMode(true)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isVoiceMode ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: isVoiceMode ? 'var(--surface)' : 'transparent',
                color: isVoiceMode ? 'var(--primary)' : 'var(--text-secondary)',
              }}>
              <MicrophoneIcon className='w-4 h-4' />
              Voice
            </button>
          </div>
        </div>

        {/* Voice Input Mode */}
        {isVoiceMode ? (
          <VoiceInput onTranscript={handleVoiceTranscript} onVoiceStart={() => {}} onVoiceEnd={() => {}} />
        ) : (
          /* Text Input Mode */
          <form onSubmit={handleSubmit} className='flex gap-4'>
            <div className='flex-1 relative'>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  currentImage
                    ? 'Describe what you see or ask a question...'
                    : 'Upload an image first to start chatting...'
                }
                disabled={isLoading || !currentImage}
                className='w-full p-4 rounded-xl resize-none min-h-[56px] max-h-32 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
                style={{
                  backgroundColor: 'var(--surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type='submit'
              disabled={!inputText.trim() || isLoading || !currentImage}
              className='px-5 py-4 rounded-xl transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[56px]'
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
              }}>
              <PaperAirplaneIcon className='w-5 h-5' />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
