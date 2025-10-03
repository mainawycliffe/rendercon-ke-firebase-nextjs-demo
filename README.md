# 📸 Photo Chat with Gemini - Next.js & Genkit Demo

A Next.js 15 application that demonstrates the power of **Genkit** with **Gemini AI** for multimodal conversations. Take photos and have voice/text conversations about them with AI!

## ✨ Features

- 📷 **Photo Capture**: Use your camera or upload images
- 🗣️ **Voice Input**: Speak your questions using Web Speech API
- 🎯 **Text Input**: Type your messages with auto-resize textarea
- 🔊 **Voice Output**: Listen to AI responses with text-to-speech
- 💬 **Conversation History**: Context-aware chat sessions
- 🤖 **Gemini AI Integration**: Powered by Google's latest AI models
- 📱 **Responsive Design**: Works on mobile and desktop

## 🛠️ Tech Stack

- **Next.js 15** with App Router
- **Genkit** for AI integration
- **Gemini AI** (Vision + Text models)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Headless UI** for accessible components
- **Heroicons** for beautiful icons

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rendercon-ke-firebase-nextjs-demo
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Demo Flow

Perfect for presentations! Here's a suggested demo flow:

### 1. **Photo Capture Demo**
- Take a live photo of the audience
- Upload a code screenshot
- Capture a whiteboard diagram

### 2. **Voice Interaction Demo**
- Click the microphone button
- Ask "What do you see in this image?"
- Show real-time speech-to-text

### 3. **AI Response Demo**
- Watch the AI analyze the image
- Click "Play" to hear the response
- Continue the conversation with follow-up questions

### 4. **Technical Features**
- Show the session management
- Demonstrate context preservation
- Switch between voice and text modes

## 📱 Usage Instructions

1. **Capture Photo**: Click "Take Photo" or "Upload Photo"
2. **Choose Input Mode**: Toggle between "Type" and "Voice"
3. **Ask Questions**: Speak or type questions about your image
4. **Listen to Responses**: Click the play button to hear AI responses
5. **Continue Conversation**: Ask follow-up questions with full context

## 🏗️ Architecture

```
src/
├── app/
│   ├── actions/chat.ts      # Server actions for AI integration
│   └── page.tsx             # Main application page
├── components/
│   ├── PhotoCapture.tsx     # Camera/upload interface
│   ├── VoiceInput.tsx       # Speech-to-text component
│   └── ChatInterface.tsx    # Chat UI with messages
├── lib/
│   ├── genkit.ts           # Genkit configuration
│   ├── session.ts          # Session management
│   └── utils.ts            # Utility functions
└── types/
    └── conversation.ts      # TypeScript interfaces
```

## 🎨 Key Components

### PhotoCapture Component
- Camera access with fallback to file upload
- Real-time video preview
- Image capture and processing
- Clean, intuitive UI

### VoiceInput Component
- Web Speech API integration
- Real-time transcription display
- Visual feedback for recording state
- Browser compatibility checks

### ChatInterface Component
- Message history with timestamps
- Auto-scrolling to new messages
- Text-to-speech for AI responses
- Loading states and animations

## 🔧 Server Actions

### `createChatSession()`
Creates a new conversation session for context management.

### `chatWithImage(sessionId, message, imageUrl?)`
Sends message to Gemini AI with optional image context.

### `getSessionHistory(sessionId)`
Retrieves conversation history for a session.

## 🌐 Deployment

### Vercel (Recommended)

```bash
pnpm build
vercel --prod
```

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform that supports Node.js.

## 🎯 Presentation Tips

1. **Test beforehand**: Ensure camera and microphone permissions work
2. **Have backup images**: Prepare interesting photos if live capture fails  
3. **Show different scenarios**: Code screenshots, diagrams, objects, people
4. **Demonstrate voice**: The voice interaction is the "wow factor"
5. **Highlight context**: Show how follow-up questions maintain context
6. **Show mobile**: Demonstrate responsive design on phone

## 🔍 Troubleshooting

### Camera Not Working
- Check browser permissions
- Try different browsers (Chrome works best)
- Use the upload fallback option

### Voice Input Not Working  
- Enable microphone permissions
- Use HTTPS (required for speech recognition)
- Try Chrome or Safari

### AI Not Responding
- Check your API key in `.env.local`
- Verify internet connection
- Check browser console for errors

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Gemini AI Documentation](https://ai.google.dev/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🤝 Contributing

This is a demo project for presentations, but feel free to fork and extend it for your own use cases!

## 📄 License

MIT License - feel free to use this for your presentations and demos.

---

**Built with ❤️ for the Next.js & Genkit community**
