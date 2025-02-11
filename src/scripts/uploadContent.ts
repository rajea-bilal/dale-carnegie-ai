import 'dotenv/config'
import { openai } from '@/lib/openai'
import { index as pineconeIndex } from '@/lib/pinecone'
import fs from 'fs'
import path from 'path'

// This represents how we structure each piece of the book's content
interface ContentChunk {
  text: string               // The actual text content
  metadata: {
    chapter: string         // Which chapter this is from
    pageNumber: number      // The page number in the book
    citation: string        // How we'll cite this in the AI's response
  }
}

/**
 * Creates an embedding (a list of numbers) that represents the meaning of the text
 * This is what allows us to search for similar content later
 */
async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Finds chapter headers in the text
 * Example: "Chapter 1: How to Win Friends" -> returns true
 */
function isChapterHeader(line: string): boolean {
  return line.trim().toLowerCase().startsWith('chapter')
}

/**
 * Finds page numbers in the text
 * Example: "Page 42" -> returns 42
 */
function getPageNumber(line: string): number | null {
  const pageMatch = line.match(/^Page (\d+)/)
  return pageMatch ? parseInt(pageMatch[1]) : null
}

/**
 * Splits the book's content into smaller, manageable chunks
 * This is necessary because AI models have a limit on how much text they can process at once
 */
function chunkContent(content: string, chunkSize: number = 500): ContentChunk[] {
  // This will hold all our chunks of text
  const chunks: ContentChunk[] = []
  
  // Split the content into lines so we can process it line by line
  const lines = content.split('\n')
  
  // Keep track of what we're currently processing
  let currentChunk = ''
  let currentChapter = 'Introduction'  // Default chapter name
  let currentPage = 1
  
  // Go through the book line by line
  for (const line of lines) {
    // Clean up the line (remove extra spaces, weird characters from PDF)
    const cleanLine = line.trim().replace(/\s+/g, ' ')
    if (!cleanLine) continue  // Skip empty lines

    // If we find a chapter header, update our current chapter
    if (isChapterHeader(cleanLine)) {
      // If we have content in the current chunk, save it before starting new chapter
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            chapter: currentChapter,
            pageNumber: currentPage,
            citation: `${currentChapter}, Page ${currentPage}`
          }
        })
        currentChunk = ''
      }
      currentChapter = cleanLine
      continue
    }

    // If we find a page number, update our current page
    const pageNum = getPageNumber(cleanLine)
    if (pageNum !== null) {
      currentPage = pageNum
      continue
    }

    // Add this line to our current chunk
    currentChunk += cleanLine + ' '

    // If the chunk is big enough, save it and start a new one
    if (currentChunk.length >= chunkSize) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          chapter: currentChapter,
          pageNumber: currentPage,
          citation: `${currentChapter}, Page ${currentPage}`
        }
      })
      currentChunk = ''  // Start fresh for next chunk
    }
  }

  // Don't forget to save the last chunk if there's anything left
  if (currentChunk.trim()) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: {
        chapter: currentChapter,
        pageNumber: currentPage,
        citation: `${currentChapter}, Page ${currentPage}`
      }
    })
  }

  return chunks
}

/**
 * Takes a chunk of text, creates its embedding, and saves it to Pinecone
 * This lets us search for relevant content later when the AI is answering questions
 */
async function uploadChunkToVectorDB(chunk: ContentChunk, chunkIndex: number) {
  try {
    // Convert the text to an embedding
    const embedding = await generateEmbedding(chunk.text)
    
    // Save to Pinecone with a unique ID
    await pineconeIndex.upsert([{
      id: `chunk-${chunkIndex}`,
      values: embedding,
      metadata: {
        text: chunk.text,
        ...chunk.metadata
      }
    }])

    console.log(`✓ Successfully uploaded chunk ${chunkIndex + 1}`)
  } catch (error) {
    console.error(`✗ Failed to upload chunk ${chunkIndex + 1}:`, error)
    throw error
  }
}

async function testPineconeContent() {
  console.log('🔍 Testing Pinecone content...')
  
  // Test query about criticism
  const testEmbedding = await generateEmbedding('handling criticism and difficult people')
  
  const results = await pineconeIndex.query({
    vector: testEmbedding,
    topK: 3,
    includeMetadata: true
  })

  console.log('\nTest Results:')
  results.matches?.forEach((match, i) => {
    console.log(`\nMatch ${i + 1}:`)
    console.log('Text:', match.metadata?.text)
    console.log('Chapter:', match.metadata?.chapter)
    console.log('Page:', match.metadata?.pageNumber)
  })
}

/**
 * The main function that orchestrates the whole process:
 * 1. Reads the book
 * 2. Splits it into chunks
 * 3. Uploads each chunk to our database
 */
async function main() {
  try {
    // Step 1: Read the book file
    console.log('📖 Reading the book file...')
    const contentPath = path.join(process.cwd(), 'data', 'carnegie.txt')
    const content = fs.readFileSync(contentPath, 'utf-8')
    console.log('✓ Successfully read the file')

    // Step 2: Split into chunks
    console.log('✂️ Splitting content into chunks...')
    const chunks = chunkContent(content)
    console.log(`✓ Created ${chunks.length} chunks`)

    // Step 3: Upload each chunk
    console.log('🚀 Uploading chunks to database...')
    console.log('This may take a while, please be patient...')
    
    for (let i = 0; i < chunks.length; i++) {
      await uploadChunkToVectorDB(chunks[i], i)
    }

    // Step 4: Verify the upload
    console.log('🔍 Verifying upload...')
    const stats = await pineconeIndex.describeIndexStats()
    console.log(`✓ Successfully stored ${stats.totalRecordCount} chunks in Pinecone`)
    
    // Step 5: Test the content
    await testPineconeContent()
    
    console.log('✨ All done! The content is ready to be used by the AI.')
  } catch (error) {
    console.error('❌ Something went wrong:', error)
    process.exit(1)
  }
}

// Start the process
console.log('🎬 Starting the content upload process...')
main() 