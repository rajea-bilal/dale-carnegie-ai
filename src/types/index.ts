import { Message as AiMessage } from 'ai'

export interface Message extends AiMessage {
  citations?: string[];
  status?: string;
}

export interface Citation {
  text: string;
  pageNumber: number;
  chapter: string;
  bookReference?: string;
}

export interface ChatContainerProps {
  // Container component that uses useChat
}

export interface ChatState {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export interface MessageListProps {
  messages: Message[] | undefined;
}

export interface MessageBubbleProps {
  message: Message;
  isLastMessage: boolean;
}

export interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export interface VectorEntry {
  id: string;
  values: number[];
  metadata: {
    text: string;
    pageNumber: number;
    chapter: string;
    citations: string;
  }
} 