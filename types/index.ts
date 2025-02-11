export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  citations?: Citation[];
}

export interface Citation {
  text: string;
  pageNumber: number;
  chapter: string;
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

export interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export interface MessageListProps {
  messages: Message[];
} 