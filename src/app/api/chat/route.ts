import { openai } from '@ai-sdk/openai'
import { createDataStreamResponse, streamText } from 'ai'
import { index } from '@/lib/pinecone'
import { getEmbedding } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    // 1. Get the messages from the request
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]

    // Return streaming response immediately
    return createDataStreamResponse({
      execute: async (dataStream) => {
        try {
          // Special case handling
          const isIdentityQuestion = lastMessage.content.toLowerCase().match(/who are you|what are you|tell me about yourself/)

          if (isIdentityQuestion) {
            // Skip vector search for identity questions
            const result = await streamText({
              // model: openai('gpt-4-turbo'),
              model: openai('gpt-4o-mini'),
              messages: [
                {
                  role: 'system',
                  content: 'You are Dale Carnegie. For identity questions, respond: "I am Dale Carnegie, author of How to Win Friends and Influence People, and I\'m here to share my proven principles for success in human relations and personal development. I\'ve taught these principles to millions through my books and courses. How can I help you today?"'
                },
                ...messages
              ]
            })
            return result.mergeIntoDataStream(dataStream)
          }

          // For all other questions, proceed with vector search
          // Initial status
          console.log('1. Query received:', lastMessage.content)
          dataStream.writeData('searching for relevant context')

          // Get embedding and search Pinecone
          const embedding = await getEmbedding(lastMessage.content).catch(() => {
            throw new Error('Failed to generate embedding. Please try again.')
          })
          console.log('2. Embedding generated:', {
            length: embedding.length,
            sample: embedding.slice(0, 5)
          })

          console.log('3. Searching Pinecone...')
          const results = await index.query({
            vector: embedding,
            topK: 5,
            includeMetadata: true,

          }).catch(() => {
            throw new Error('Failed to search knowledge base. Please try again.')
          })

          console.log('4. Pinecone search results:', {
            matchCount: results.matches?.length,
            matches: results.matches?.map(match => ({
              score: match.score,
              metadata: match.metadata
            }))
          })

          const contextWithCitations = results.matches?.map(match => ({
            text: match.metadata?.text,
            citation: `${match.metadata?.chapter}, Page ${match.metadata?.pageNumber}`,
            relevanceScore: match.score
          }))

          console.log('5. Processed citations:', contextWithCitations)

          // Only use the top 2-3 most relevant chunks for context
          const context = contextWithCitations.slice(0, 3).map(item => item.text).join('\n')
          const citations = contextWithCitations.slice(0, 3).map(item => item.citation)

          console.log('6. Final context being sent to OpenAI:', context)

          // Write citations as message annotation
          dataStream.writeMessageAnnotation({
            citations,
            // Add additional metadata to help with debugging
            citationsFound: citations.length > 0,
            contextLength: context.length,

          })

          const systemPrompt = `
        I am Dale Carnegie. 

        SPECIAL CASES:
        If the question is "Who are you?" or similar:
        ALWAYS respond: "I am Dale Carnegie, author of How to Win Friends and Influence People, and I'm here to share my proven principles for success in human relations and personal development. I've taught these principles to millions through my books and courses. How can I help you today?"

        FOR ALL OTHER QUESTIONS:
        1. Use ONLY the following context to answer:
        ---BEGIN CONTEXT---
        ${context}
        ---END CONTEXT---

        2. Format your response EXACTLY like this:
        
        [1-2 sentences answering the question in Dale Carnegie's warm words, and reuse the same style as the context]

          • Carnegie Principle: [Include the most relevant principle from the context, if there is one]
          • Try this: [Advice from Dale Carnegie in the form of a one-line actionable command]
          • Example: [One specific example or story from the context that illustrates the advice]
          
          Sources:
          (1) Chapter <number>: "<chapter name>" (p. <page number>).

        3. Response Guidelines:
        - Keep your initial response brief, warm and straight to the point
        - Always end with the source information
        - Use word-for-word quotes when possible
        - Total length: 1-2 short paragraphs maximum

        4. If no exact context match is found, say:
        "I need to be direct - while I'd love to help, I'd be happy to share my principles about:
        • ${contextWithCitations.map(c => c.citation).join('\n• ')}"

        5. Example Format:
        The key to influencing others is to genuinely show interest in them first. People care more about their own concerns than yours.

          • Carnegie Principle: Become genuinely interested in other people.
          • Try this: Ask thoughtful questions about someone's interests and listen with sincere attention.
          • Example: When I met a botanist at a dinner party, I spent the evening asking about his specialty and listened with fascination. He later told others I was a "most interesting conversationalist" though I barely spoke.

          Sources:
          (1) Chapter 5: "Building Relationships" (p. 89).
          (2) Chapter 7: "Effective Communication" (p. 112).`

          try {
            // Stream the text response
            const result = streamText({
              model: openai('gpt-4o-mini'),
              // model: openai('gpt-4-turbo'),
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                ...messages
              ],
              onFinish: () => {
                dataStream.writeData('response completed')
              }
            })

            // Merge the text stream into our data stream
            result.mergeIntoDataStream(dataStream)
          } catch {
            throw new Error('Failed to generate response. Please try again.')
          }
        } catch (error) {
          // Handle specific errors in the stream
          const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
          dataStream.writeData(message)
        }
      },
      onError: (error) => {
        console.error('Stream error:', error)
        return 'An error occurred during the conversation. Please try again.'
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Failed to process your request. Please try again.', { status: 500 })
  }
} 