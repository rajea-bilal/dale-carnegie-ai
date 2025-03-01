import { openai } from "@ai-sdk/openai";
import { createDataStreamResponse, generateText, streamText } from "ai";
import { index } from "@/lib/pinecone";
import { getEmbedding } from "@/lib/openai";
import { getAuth } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";

// ======= INTERFACES & TYPES =======

// Core domain entities and DTOs
interface Message {
  role: string;
  content: string;
}

interface ChatSession {
  chatId: string;
  userId: string;
  messages: Message[];
}

interface CitationItem {
  text: string;
  principle: string;
  citation: string;
  relevanceScore: number;
}

interface SearchResult {
  context: string;
  citations: string[];
  citationsFound: boolean;
  contextLength: number;
  allContextItems: CitationItem[];
}

// Service interfaces following Dependency Inversion Principle
interface IChatRepository {
  validateChat(chatId: string, userId: string): Promise<string | null>;
  updateChatTimestamp(chatId: string): Promise<void>;
  saveMessage(chatId: string, role: string, content: string): Promise<void>;
  updateChatTitle(chatId: string, title: string): Promise<void>;
}

interface IContextSearchService {
  search(query: string, dataStream: any): Promise<SearchResult>;
}

interface IResponseGenerationService {
  generateIdentityResponse(
    messages: Message[],
    chatId: string,
    dataStream: any
  ): Promise<any>;
  generateContextualResponse(
    messages: Message[],
    context: string,
    contextWithCitations: CitationItem[],
    chatId: string,
    dataStream: any
  ): Promise<void>;
}

// ======= IMPLEMENTATIONS =======

// Repository implementation following Single Responsibility Principle
class PostgresChatRepository implements IChatRepository {
  async validateChat(chatId: string, userId: string): Promise<string | null> {
    const { rows } = await sql`
      SELECT id FROM chats 
      WHERE id = ${chatId} AND user_id = ${userId}
    `;

    return rows.length > 0 ? chatId : null;
  }

  async updateChatTimestamp(chatId: string): Promise<void> {
    const now = new Date().toISOString();
    await sql`
      UPDATE chats
      SET updated_at = ${now}
      WHERE id = ${chatId}
    `;
  }

  async saveMessage(
    chatId: string,
    role: string,
    content: string
  ): Promise<void> {
    const now = new Date().toISOString();
    await sql`
      INSERT INTO messages (chat_id, role, content, created_at)
      VALUES (${chatId}, ${role}, ${content}, ${now})
    `;
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    await sql`
      UPDATE chats
      SET title = ${title}
      WHERE id = ${chatId}
    `;
  }
}

// Vector search service following Single Responsibility Principle
class PineconeContextSearchService implements IContextSearchService {
  async search(query: string, dataStream: any): Promise<SearchResult> {
    console.log("1. Query received:", query);
    dataStream.writeData("searching for relevant context");

    // Generate embedding for the query
    const embedding = await getEmbedding(query).catch(() => {
      throw new Error("Failed to generate embedding. Please try again.");
    });

    console.log("2. Embedding generated:", {
      length: embedding.length,
      sample: embedding.slice(0, 5),
    });

    // Search Pinecone with the embedding
    console.log("3. Searching Pinecone...");
    const results = await index
      .query({
        vector: embedding,
        topK: 5,
        includeMetadata: true,
      })
      .catch(() => {
        throw new Error("Failed to search knowledge base. Please try again.");
      });

    console.log("4. Pinecone search results:", {
      matchCount: results.matches?.length,
      matches: results.matches?.map((match) => ({
        score: match.score,
        metadata: match.metadata,
      })),
    });

    // Process and prepare citations
    const allContextItems = results.matches?.map((match) => ({
      text: match.metadata?.text,
      principle: match.metadata?.principle,
      citation: match.metadata?.citation,
      // citation: `${match.metadata?.chapter}, Page ${match.metadata?.pageNumber}`,
      relevanceScore: match.score,
    }));

    console.log("5. Processed citations:", allContextItems);

    // Only use the top 2-3 most relevant chunks for context
    const topItems = allContextItems.slice(0, 3);
    const context = topItems.map((item) => item.text).join("\n");
    const citations = topItems.map((item) => item.citation);

    console.log("6. Final context being sent to OpenAI:", context);

    return {
      context,
      citations,
      citationsFound: citations.length > 0,
      contextLength: context.length,
      allContextItems,
    };
  }
}

// Response generation service following Open/Closed and Single Responsibility Principles
class OpenAIResponseGenerationService implements IResponseGenerationService {
  private chatRepository: IChatRepository;

  constructor(chatRepository: IChatRepository) {
    this.chatRepository = chatRepository;
  }

  async generateIdentityResponse(
    messages: Message[],
    chatId: string,
    dataStream: any
  ) {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are Dale Carnegie. For identity questions, respond: \"I am Dale Carnegie, author of How to Win Friends and Influence People, and I'm here to share my proven principles for success in human relations and personal development. I've taught these principles to millions through my books and courses. How can I help you today?\"",
        },
        ...messages,
      ],
      onFinish: async (completion) => {
        await this.chatRepository.saveMessage(
          chatId,
          "assistant",
          completion.text
        );
        dataStream.writeData("response completed");
      },
    });

    return result.mergeIntoDataStream(dataStream);
  }

  async generateContextualResponse(
    messages: Message[],
    context: string,
    contextWithCitations: CitationItem[],
    chatId: string,
    dataStream: any
  ): Promise<void> {
    try {
      const systemPrompt = this.generateSystemPrompt(
        context,
        contextWithCitations
      );

      // Stream the text response
      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        onFinish: async (completion) => {
          await this.chatRepository.saveMessage(
            chatId,
            "assistant",
            completion.text
          );
          dataStream.writeData("response completed");
        },
      });

      // Merge the text stream into our data stream
      result.mergeIntoDataStream(dataStream);
    } catch (error) {
      throw error;
    }
  }
  // (1) Chapter <number>: "<chapter name>" (p. <page number>).
  // (1) <citation> -> the main source for this should be the citation from the context

  // Helper method to generate system prompt - private to encapsulate implementation details
  private generateSystemPrompt(
    context: string,
    contextWithCitations: CitationItem[]
  ): string {
    const firstPrinciple = contextWithCitations[0].principle.split(':').slice(1).join(':').trim();

    return `
    I am Dale Carnegie. 

    SPECIAL CASES:
    If the question is "Who are you?" or similar:
    ALWAYS respond: "I am Dale Carnegie, author of How to Win Friends and Influence People, and I'm here to share my proven principles for success in human relations and personal development. I've taught these principles to millions through my books and courses. How can I help you today?"

    FOR ALL OTHER QUESTIONS:
    1. Use ONLY the following context to answer:
    ---BEGIN CONTEXT---
    ${context}
    ---END CONTEXT---

    2. Format your response in this exact format:
    
    [1-2 sentences answering the question in Dale Carnegie's warm words, and reuse the same style as the context]

      • Carnegie Principle: [Include the most relevant principle from the context, if there is one]
      • Try this: [Advice from Dale Carnegie in the form of a one-line actionable command]
      • Example: [One specific example or story from the context that illustrates the advice. Here you can make the text longer if needed. At most 3 lines.]
      
      Sources:
      - ${contextWithCitations.slice(0, 2).map((c) => c.citation).join("\n- ")}

    3. Response Guidelines:
    - Keep your initial response brief, warm and straight to the point
    - Always end with the source information
    - Use word-for-word quotes when possible
    - Total length: 1-2 short paragraphs maximum

    4. If no exact context match is found, say:
    "I need to be direct - while I'd love to help, I'd be happy to share my principles about:
    • ${contextWithCitations.map((c) => c.citation).join("\n• ")}"

    5. Example Format:
    The key to influencing others is to genuinely show interest in them first. People care more about their own concerns than yours.

      • Carnegie Principle: ${firstPrinciple}
      • Try this: Ask thoughtful questions about someone's interests and listen with sincere attention.
      • Example: When I met a botanist at a dinner party, I spent the evening asking about his specialty and listened with fascination. He later told others I was a "most interesting conversationalist" though I barely spoke.

      Sources:
      - ${contextWithCitations.slice(0, 2).map((c) => c.citation).join("\n- ")}`;
  }
}

// Message handler service - orchestrates the process
class ChatMessageHandler {
  private chatRepository: IChatRepository;
  private contextSearchService: IContextSearchService;
  private responseGenerationService: IResponseGenerationService;

  constructor(
    chatRepository: IChatRepository,
    contextSearchService: IContextSearchService,
    responseGenerationService: IResponseGenerationService
  ) {
    this.chatRepository = chatRepository;
    this.contextSearchService = contextSearchService;
    this.responseGenerationService = responseGenerationService;
  }

  async validateAndUpdateChat(
    userId: string,
    chatId: string
  ): Promise<string | null> {
    const validChatId = await this.chatRepository.validateChat(chatId, userId);

    if (validChatId) {
      await this.chatRepository.updateChatTimestamp(validChatId);
    }

    return validChatId;
  }

  async saveUserMessage(
    chatId: string,
    role: string,
    content: string
  ): Promise<void> {
    await this.chatRepository.saveMessage(chatId, role, content);
  }

  async generateAndUpdateChatTitle(
    chatId: string,
    firstMessage: string
  ): Promise<string | void> {
    try {
      const { text: title } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Generate a concise and descriptive title (maximum 6 words) for a chat that starts with this message: "${firstMessage}", do not include quotes.`,
      });

      // Update the chat title in the database
      await this.chatRepository.updateChatTitle(chatId, title);

      console.log(`Generated and updated chat title: ${title}`);

      return title;
    } catch (error) {
      console.error("Error generating chat title:", error);
      // If title generation fails, we continue without updating the title
    }
  }

  createStreamingResponse(
    messages: Message[],
    lastMessage: Message,
    chatId: string,
    title?: string
  ) {
    const headers: Record<string, string> = {
      "X-Chat-ID": chatId,
    };

    if (title) headers["X-Chat-Title"] = title;

    return createDataStreamResponse({
      execute: async (dataStream) => {
        try {
          // Check if this is an identity question
          const isIdentityQuestion = this.isIdentityQuestion(
            lastMessage.content
          );

          if (isIdentityQuestion) {
            // Handle identity question
            return await this.responseGenerationService.generateIdentityResponse(
              messages,
              chatId,
              dataStream
            );
          } else {
            // Process normal query
            await this.processRegularQuery(
              messages,
              lastMessage,
              chatId,
              dataStream
            );
          }
        } catch (error) {
          // Handle specific errors in the stream
          const message =
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.";
          dataStream.writeData(message);
        }
      },
      onError: (error) => {
        console.error("Stream error:", error);
        return "An error occurred during the conversation. Please try again.";
      },
      headers,
    });
  }

  // Private helper methods following Single Responsibility Principle
  private isIdentityQuestion(content: string): boolean {
    return Boolean(
      content
        .toLowerCase()
        .match(/who are you|what are you|tell me about yourself/)
    );
  }

  private async processRegularQuery(
    messages: Message[],
    lastMessage: Message,
    chatId: string,
    dataStream: any
  ): Promise<void> {
    try {
      // Search for relevant context
      const searchResult = await this.contextSearchService.search(
        lastMessage.content,
        dataStream
      );

      // Add citations as message annotation
      dataStream.writeMessageAnnotation({
        citations: searchResult.citations,
        citationsFound: searchResult.citationsFound,
        contextLength: searchResult.contextLength,
      });

      // Generate response based on context
      await this.responseGenerationService.generateContextualResponse(
        messages,
        searchResult.context,
        searchResult.allContextItems,
        chatId,
        dataStream
      );
    } catch (error) {
      throw error;
    }
  }
}

// ======= REQUEST HANDLER =======

export async function POST(req: NextRequest) {
  try {
    // Set up services using Dependency Injection
    const chatRepository = new PostgresChatRepository();
    const contextSearchService = new PineconeContextSearchService();
    const responseGenerationService = new OpenAIResponseGenerationService(
      chatRepository
    );
    const chatHandler = new ChatMessageHandler(
      chatRepository,
      contextSearchService,
      responseGenerationService
    );

    // Extract data and authenticate
    const { messages, chatId } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const { userId } = getAuth(req);

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Validate and update chat
    const currentChatId = await chatHandler.validateAndUpdateChat(
      userId,
      chatId
    );

    if (!currentChatId) {
      return new Response("Chat not found", { status: 404 });
    }

    // Save user message to database
    await chatHandler.saveUserMessage(
      currentChatId,
      lastMessage.role,
      lastMessage.content
    );

    let chatTitle;
    // Generate and update chat title
    if (messages.length === 1) {
      chatTitle = await chatHandler.generateAndUpdateChatTitle(
        currentChatId,
        lastMessage.content
      );
    }

    // Create and return streaming response
    return chatHandler.createStreamingResponse(
      messages,
      lastMessage,
      currentChatId,
      chatTitle
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Failed to process your request. Please try again.", {
      status: 500,
    });
  }
}
