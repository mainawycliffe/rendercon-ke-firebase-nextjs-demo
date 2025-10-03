'use client';

import { ArrowUpTrayIcon, CameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface PhotoCaptureProps {
  onImageCapture: (imageUrl: string) => void;
  currentImage?: string;
  disabled?: boolean;
}

export default function PhotoCapture({ onImageCapture, currentImage, disabled = false }: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    if (disabled) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Try to use back camera on mobile
      });
      setStream(mediaStream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file input if camera fails
      if (!disabled) {
        fileInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set max dimensions for demo (reduce size)
        const maxWidth = 800;
        let { videoWidth: width, videoHeight: height } = video;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        // Use higher compression for camera captures
        const imageUrl = canvas.toDataURL('image/jpeg', 0.6);
        onImageCapture(imageUrl);
        stopCamera();
      }
    }
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        // Compress image before uploading
        const compressedImageUrl = await compressImage(file);
        onImageCapture(compressedImageUrl);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          onImageCapture(imageUrl);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };
  const clearImage = () => {
    onImageCapture('');
  };

  return (
    <div className='w-full space-y-6'>
      {/* Current Image Display */}
      {currentImage && !isCapturing && (
        <div className='relative group'>
          <div
            className='relative rounded-2xl overflow-hidden border-2 transition-all duration-300 group-hover:shadow-lg'
            style={{ borderColor: 'var(--border)' }}>
            <Image
              src={currentImage}
              alt='Captured'
              width={800}
              height={320}
              className='w-full h-80 object-cover'
              unoptimized
            />

            {/* Overlay on hover */}
            <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
              <button
                onClick={clearImage}
                className='p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg'
                title='Remove image'>
                <XMarkIcon className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Image info */}
          <div className='mt-3 p-3 rounded-xl text-center' style={{ backgroundColor: 'var(--surface-elevated)' }}>
            <p className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>
              Image ready for analysis
            </p>
            <p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>
              Start chatting to explore what&apos;s in your image
            </p>
          </div>
        </div>
      )}

      {/* Camera View */}
      {isCapturing && (
        <div className='space-y-4'>
          <div className='relative rounded-2xl overflow-hidden border-2' style={{ borderColor: 'var(--primary)' }}>
            <video ref={videoRef} autoPlay playsInline className='w-full h-80 object-cover' />

            {/* Camera overlay */}
            <div className='absolute inset-0 pointer-events-none'>
              <div className='absolute top-4 left-4 right-4 flex justify-between items-center'>
                <div
                  className='px-3 py-1.5 rounded-full text-xs font-medium'
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                  Camera Active
                </div>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className='hidden' />

          <div className='flex justify-center gap-4'>
            <button
              onClick={capturePhoto}
              className='px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center gap-2 text-white'
              style={{ backgroundColor: 'var(--primary)' }}>
              <CameraIcon className='w-5 h-5' />
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className='px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center gap-2'
              style={{
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isCapturing && !currentImage && (
        <div className='space-y-4'>
          {/* Empty state illustration */}
          <div
            className='h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-8'
            style={{ borderColor: 'var(--border)' }}>
            <div
              className='w-16 h-16 rounded-2xl flex items-center justify-center mb-4'
              style={{ backgroundColor: 'var(--surface-elevated)' }}>
              <PhotoIcon className='w-8 h-8' style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className='text-lg font-semibold mb-2' style={{ color: 'var(--text-primary)' }}>
              No image selected
            </h3>
            <p className='text-sm mb-6' style={{ color: 'var(--text-muted)' }}>
              Take a photo or upload an image to start your AI conversation
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons - Always show if no current image */}
      {!isCapturing && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <button
            onClick={startCamera}
            disabled={disabled || isProcessing}
            className={`p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 text-white ${
              disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
            }`}
            style={{ backgroundColor: 'var(--primary)' }}>
            <CameraIcon className='w-5 h-5' />
            <span>{isProcessing ? 'Processing...' : disabled ? 'Demo Limit Reached' : 'Take Photo'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessing}
            className={`p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
              disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
            }`}
            style={{
              backgroundColor: 'var(--surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}>
            <ArrowUpTrayIcon className='w-5 h-5' />
            <span>{isProcessing ? 'Processing...' : disabled ? 'Max 3 Images' : 'Upload Image'}</span>
          </button>
        </div>
      )}

      {/* Show replace button when image exists */}
      {currentImage && !isCapturing && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <button
            onClick={startCamera}
            className='p-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2'
            style={{
              backgroundColor: 'var(--surface-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
            <CameraIcon className='w-4 h-4' />
            <span>Take New Photo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className='p-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2'
            style={{
              backgroundColor: 'var(--surface-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
            <ArrowUpTrayIcon className='w-4 h-4' />
            <span>Upload New</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileUpload} className='hidden' />
    </div>
  );
}
