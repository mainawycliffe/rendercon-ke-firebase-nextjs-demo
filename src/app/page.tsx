'use client';

import ChatInterface from '@/components/ChatInterface';
import PhotoCapture from '@/components/PhotoCapture';
import { Message } from '@/types/conversation';
import Image from 'next/image';
import { useState } from 'react';
import { chatWithImage } from './actions/chat';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageCapture = (imageUrl: string) => {
    if (imageUrl === '') {
      // Clear all images
      setImages([]);
      setMessages([]);
      return;
    }

    // Add new image, enforcing 3-image limit for demo
    setImages((prev) => {
      const newImages = [...prev, imageUrl];
      if (newImages.length > 3) {
        // Remove oldest image if exceeding limit
        return newImages.slice(-3);
      }
      return newImages;
    });

    // Clear messages when new image is added
    setMessages([]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Clear messages when images change
    setMessages([]);
  };

  const handleSendMessage = async (message: string) => {
    if (images.length === 0) {
      // Add a system message if no images are provided
      const systemMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please upload or capture an image first so I can analyze it for you.',
        timestamp: new Date(),
      };
      setMessages([systemMessage]);
      return;
    }

    setIsLoading(true);

    // Add user message to local state
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      imageUrl: images[0], // Use first image for message display
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Convert messages to conversation history format
      const conversationHistory = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Include context about multiple images in the message
      let enhancedMessage = message;
      if (images.length > 1) {
        enhancedMessage = `I have ${images.length} images to analyze. ${message}`;
      }

      const response = await chatWithImage(enhancedMessage, images[0], conversationHistory);

      if (response.success) {
        // Add AI response to local state
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.error('Chat error:', response.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className='border-b' style={{ borderColor: 'var(--border)' }}>
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold' style={{ color: 'var(--text-primary)' }}>
                Lens
              </h1>
              <p className='text-sm mt-1' style={{ color: 'var(--text-secondary)' }}>
                AI-powered image analysis demo
              </p>
            </div>
            <div
              className='flex items-center gap-2 px-3 py-1.5 rounded-full text-xs'
              style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              Ready
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
          {/* Photo Section */}
          <div
            className='rounded-2xl shadow-lg border'
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}>
            <div className='p-6 border-b' style={{ borderColor: 'var(--border-light)' }}>
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center'
                  style={{ backgroundColor: 'var(--primary-light)' }}>
                  <svg className='w-5 h-5' style={{ color: 'var(--primary)' }} fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>
                    Image Input
                  </h2>
                  <p className='text-sm' style={{ color: 'var(--text-muted)' }}>
                    Upload or capture an image
                  </p>
                </div>
              </div>
            </div>

            <div className='p-6'>
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>
                        Images for Analysis
                      </h3>
                      <span
                        className='text-xs px-2 py-1 rounded-full'
                        style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {images.length}/3
                      </span>
                    </div>
                    {images.length >= 3 && (
                      <span className='text-xs' style={{ color: 'var(--text-muted)' }}>
                        Demo limit reached
                      </span>
                    )}
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {images.map((imageUrl, index) => (
                      <div key={index} className='relative group'>
                        <div
                          className='aspect-square rounded-xl overflow-hidden border'
                          style={{ borderColor: 'var(--border)' }}>
                          <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            width={200}
                            height={200}
                            className='w-full h-full object-cover'
                            unoptimized
                          />
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
                          title='Remove image'>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PhotoCapture
                onImageCapture={handleImageCapture}
                currentImage={images.length > 0 ? images[images.length - 1] : ''}
                disabled={images.length >= 3}
              />
            </div>
          </div>

          {/* Chat Section */}
          <div
            className='rounded-2xl shadow-lg border flex flex-col h-full'
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-lg)',
              height: 'calc(100vh - 200px)', // Fixed height for proper scrolling
              minHeight: '600px',
            }}>
            <div className='p-6 border-b' style={{ borderColor: 'var(--border-light)' }}>
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-xl flex items-center justify-center'
                  style={{ backgroundColor: 'var(--accent)' }}>
                  <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>
                    AI Analysis
                  </h2>
                  <p className='text-sm' style={{ color: 'var(--text-muted)' }}>
                    Chat about the image content
                  </p>
                </div>
              </div>
            </div>

            <div className='flex flex-col flex-1 min-h-0 overflow-y-auto'>
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                currentImage={images.length > 0 ? images[0] : ''}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
