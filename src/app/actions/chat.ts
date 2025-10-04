'use server';

import { ai } from '@/lib/genkit';
import { ChatResponse } from '@/types/conversation';

// System prompt for image analysis
const SYSTEM_PROMPT = `You are an expert AI-powered image analysis tool with advanced computer vision capabilities. Your role is to:

• Provide detailed, accurate analysis of images
• Identify objects, people, scenes, text, and visual elements
• Describe composition, colors, lighting, and artistic elements
• Answer specific questions about image content
• Offer insights about context, meaning, and relationships within images
• Be precise, professional, and informative in your responses

IMPORTANT: Keep your responses concise and focused - maximum 600 words. Prioritize the most relevant information for the user's specific question.

`;

export async function uploadImage(
  formData: FormData,
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const file = formData.get('image') as File;
    if (!file) {
      return { success: false, error: 'No image provided' };
    }

    // Convert file to base64 data URL for in-memory storage (in production, use cloud storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const imageUrl = `data:${mimeType};base64,${base64}`;

    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Failed to process image' };
  }
}

export async function chatWithImage(
  message: string,
  imageUrl?: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<ChatResponse> {
  try {
    // Check if image is provided
    if (!imageUrl || imageUrl.trim() === '') {
      return {
        message:
          'Please upload or capture an image first so I can analyze it for you. I need to see the image to provide accurate analysis and answer your questions.',
        success: false,
        error: 'No image provided',
      };
    }

    // Build the prompt using system prompt
    let textPrompt = SYSTEM_PROMPT;

    // Add conversation history if provided (limit to 3 exchanges for demo)
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentHistory = conversationHistory
        .slice(-10) // Keep last 10 messages (5 exchanges)
        .filter((msg) => msg && typeof msg === 'object' && msg.role && msg.content)
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      if (recentHistory.trim()) {
        textPrompt += `Previous conversation context:\n${recentHistory}\n\n`;
      }
    }

    // Add the user's question
    textPrompt += `User Request: ${message}\n\nPlease analyze the provided image and respond to the user's specific question. Keep your response focused and under 600 words.`;

    // Extract the mime type from data URL
    const [mimeTypePart] = imageUrl.split(',');
    const mimeType = mimeTypePart.match(/data:([^;]+)/)?.[1] || 'image/jpeg';

    // Use multimodal parts array with URL format
    const parts = [
      { text: textPrompt },
      {
        media: {
          url: imageUrl,
          contentType: mimeType,
        },
      },
    ];

    try {
      // Generate AI response with token limit for concise responses
      const response = await ai.generate({
        prompt: parts,
        config: {
          temperature: 0.7,
          maxOutputTokens: 400, // ~600 words limit for demo
        },
      });

      return {
        message: response.text,
        success: true,
      };
    } catch (multimodalError) {
      console.error('Multimodal generation failed:', multimodalError);
      return {
        message: `I encountered an error while analyzing your image. This could be due to image format issues, connectivity problems, or temporary service unavailability. Please try again with a different image or check your connection.\n\nError details: ${
          multimodalError instanceof Error ? multimodalError.message : 'Unknown error'
        }`,
        success: false,
        error: 'Multimodal generation failed',
      };
    }
  } catch (error) {
    console.error('Error in chatWithImage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      message: `I'm sorry, but I encountered an unexpected error while processing your request. This might be due to a temporary service issue or network problem.\n\nPlease try again in a moment. If the issue persists, try refreshing the page or using a different image.\n\nTechnical details: ${errorMessage}`,
      success: false,
      error: 'Processing failed',
    };
  }
}
