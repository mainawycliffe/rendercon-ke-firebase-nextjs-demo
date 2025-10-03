export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
}

export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}
