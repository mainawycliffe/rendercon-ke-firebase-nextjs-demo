'use server';

import { ai } from '@/lib/genkit';
import { ChatResponse } from '@/types/conversation';

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
    // Debug logging
    console.log('chatWithImage called with:', {
      message: message?.length,
      imageUrl: !!imageUrl,
      conversationHistoryType: typeof conversationHistory,
      conversationHistoryIsArray: Array.isArray(conversationHistory),
      conversationHistoryLength: conversationHistory?.length,
    });

    // Build the prompt with better multimodal support
    let textPrompt = `You are an expert AI-powered image analysis tool with advanced computer vision capabilities. Your role is to:

• Provide detailed, accurate analysis of images
• Identify objects, people, scenes, text, and visual elements
• Describe composition, colors, lighting, and artistic elements
• Answer specific questions about image content
• Offer insights about context, meaning, and relationships within images
• Be precise, professional, and informative in your responses

IMPORTANT: Keep your responses concise and focused - maximum 600 words. Prioritize the most relevant information for the user's specific question.

`;

    // Add conversation history if provided (limit to 3 exchanges for demo)
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      try {
        const recentHistory = conversationHistory
          .slice(-6) // Keep last 6 messages (3 exchanges)
          .filter((msg) => msg && typeof msg === 'object' && msg.role && msg.content) // Additional safety check
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');

        if (recentHistory.trim()) {
          textPrompt += `Previous conversation context:\n${recentHistory}\n\n`;
        }
      } catch (error) {
        console.error('Error processing conversation history:', error);
        console.error('conversationHistory type:', typeof conversationHistory);
        console.error('conversationHistory value:', JSON.stringify(conversationHistory, null, 2));
        // Continue without conversation history if there's an error
      }
    }

    // Add the user's question
    textPrompt += `User Request: ${message}

Please analyze the provided image and respond to the user's specific question. Keep your response focused and under 600 words.`;

    // Try multimodal approach with proper Genkit API
    if (imageUrl) {
      // Extract the mime type from data URL
      const [mimeTypePart] = imageUrl.split(',');
      const mimeType = mimeTypePart.match(/data:([^;]+)/)?.[1] || 'image/jpeg';

      // Use multimodal parts array with URL format
      const parts = [
        { text: textPrompt },
        {
          media: {
            url: imageUrl, // Use the full data URL
            contentType: mimeType,
          },
        },
      ];

      try {
        // Try multimodal generation with token limit for concise responses
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
        console.log('Multimodal failed, falling back to text-only:', multimodalError);
        // Fall back to text-only if multimodal fails
        textPrompt += `\n\n[Image provided with type: ${mimeType}. Please analyze this image and respond to the user's question.]`;
      }
    }

    // Generate response with Genkit (text-only fallback)
    const response = await ai.generate({
      prompt: textPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 400, // ~600 words limit for demo
      },
    });

    const aiResponse = response.text;

    return {
      message: aiResponse,
      success: true,
    };
  } catch (error) {
    console.error('Error in chatWithImage:', error);
    return {
      message: 'Sorry, I encountered an error while processing your request.',
      success: false,
      error: 'Failed to generate response',
    };
  }
}
