# Dale Carnegie Chatbot - Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Product Description
An AI-powered chatbot that allows users to interact with Dale Carnegie's teachings through a conversational interface. The bot provides responses based on Carnegie's book "How to Win Friends and Influence People," using exact quotes and references when possible.

### 1.2 Goals
- Create an interactive way to learn Carnegie's principles
- Provide accurate, sourced responses from the book
- Maintain Carnegie's teaching style and tone
- Deliver responses with proper citations

### 1.3 Technology Stack
- Frontend: Next.js 14 (App Router)
- UI Components: shadcn/ui
- Vector Database: Pinecone
- AI: OpenAI GPT-4
- Embedding: OpenAI Ada-002
- Integration: LangChain.js
- Streaming: AI SDK

## 2. Technical Architecture

### 2.1 Project Structure
```
dale-carnegie-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ChatInput.tsx
│   └── ui/
│       └── [shadcn components]
├── lib/
│   ├── pinecone.ts
│   ├── openai.ts
│   └── utils.ts
├── scripts/
│   ├── books/
│   │   └── carnegie.pdf
│   └── uploadBook.ts
└── types/
    └── index.ts
```

### 2.2 Database Schema (Pinecone)
Vector Store Structure:
```typescript
interface VectorEntry {
  id: string;          // Unique identifier
  values: number[];    // Embedding vector
  metadata: {
    text: string;      // Original text chunk
    pageNumber: number;// Source page number
    chapter: string;   // Chapter reference
    citations: string; // Citation information
  }
}
```

## 3. Feature Requirements

### 3.1 Core Features

#### 3.1.1 Chat Interface
- Real-time message streaming
- Message history display
- Input field with send button
- Loading states and typing indicators
- Citation display with book references
- Error handling with user-friendly messages

#### 3.1.2 Response Generation
- Context-aware responses
- Proper citation of sources
- Maintenance of conversation history
- Carnegie's teaching style preservation

### 3.2 API Endpoints

#### 3.2.1 Chat Endpoint
```typescript
POST /api/chat
Request:
{
  messages: [
    { role: "user" | "assistant", content: string }
  ]
}

Response: 
StreamingTextResponse (AI SDK)
```

## 4. UI Components Specification

### 4.1 ChatContainer
```typescript
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  citations?: string[];
}

// ChatContainer.tsx
export function ChatContainer() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      if (response.ok) {
        console.log('Response started');
      }
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <MessageList messages={messages} />
      </ScrollArea>
      <div className="p-4 border-t">
        <ChatInput 
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </Card>
  );
}
```

### 4.2 MessageList & MessageBubble
```typescript
// MessageList.tsx
interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

// MessageBubble component styling
const bubbleStyles = {
  user: "bg-primary text-primary-foreground justify-end",
  assistant: "bg-muted justify-start"
};
```

### 4.3 ChatInput
```typescript
interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}
```

## 5. Initial Setup Process

### 5.1 Book Processing
1. Place PDF in scripts/books/
2. Run uploadBook.ts script
3. Process includes:
   - PDF text extraction
   - Chunk creation
   - Embedding generation
   - Pinecone storage

### 5.2 Environment Variables
```bash
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX=
```

## 6. Development Guidelines

### 6.1 Code Style
- Use TypeScript for type safety
- Follow Next.js App Router patterns
- Implement error boundaries
- Use proper loading states
- Handle edge cases

### 6.2 Error Handling
```typescript
try {
  // API calls
} catch (error) {
  if (error instanceof RateLimitError) {
    return { error: 'Please try again later' };
  }
  if (error instanceof AuthError) {
    return { error: 'Authentication failed' };
  }
  return { error: 'An unexpected error occurred' };
}
```

## 7. Testing Scenarios

### 7.1 Core Functionality Tests
- Message sending/receiving
- Context maintenance
- Citation accuracy
- Error handling
- Loading states
- Stream processing

### 7.2 Edge Cases
- Empty messages
- Long messages
- Network failures
- Rate limiting
- Invalid inputs

## 8. Performance Requirements

### 8.1 Response Times
- Initial response: < 1 second
- Streaming start: < 100ms
- Message rendering: < 16ms

### 8.2 Rate Limits
- OpenAI: Manage token limits
- Pinecone: Handle query limits
- Implement appropriate error handling

## 9. Security Considerations

### 9.1 API Protection
- Rate limiting
- Input validation
- Error handling
- Secure environment variables

### 9.2 Data Handling
- Secure storage of API keys
- No PII collection
- Proper error logging

## 10. Deployment Checklist

### 10.1 Pre-deployment
- Environment variables set
- Book content processed
- Vector store populated
- Error handling tested
- Performance verified

### 10.2 Post-deployment
- Monitor error rates
- Check response times
- Verify streaming functionality
- Validate citations
