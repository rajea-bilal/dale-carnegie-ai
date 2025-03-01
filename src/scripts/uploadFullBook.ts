import 'dotenv/config'
import { openai } from '@/lib/openai'
import { index as pineconeIndex } from '@/lib/pinecone'
import fs from 'fs'
import path from 'path'

// This represents how we structure each piece of the book's content
interface ContentChunk {
  text: string               // The actual text content  
  metadata: {
    part: string           // Which part of the book this is from (4 parts in total)
    principle: string      // Which principle of the part this is from (12 principles in total)
    pageNumber: number     // The page number in the book
    citation: string       // How we'll cite this in the AI's response
  }
}

/**
 * Creates an embedding (a list of numbers) that represents the meaning of the text
 * This is what allows us to search for similar content later
 */
async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Finds part headers in the text
 * Example: "PART 4: How To Change People..." -> returns "Part 4: How To Change People..."
 */
function isPartHeader(line: string): string | null {
  const match = line.trim().match(/^PART\s*(\d+):\s*(.+)/i)
  return match ? `Part ${match[1]}: ${match[2]}` : null
}


/**
 * Finds principle headers and descriptions in the text
 * Example: "PRINCIPLE 1: Don't criticize, condemn or complain." 
 * -> returns { number: "1", text: "Don't criticize, condemn or complain" }
 */
function getPrinciple(line: string): { number: string, text: string } | null {
  const match = line.trim().match(/^PRINCIPLE\s+(\d+):\s*(.+)$/i)
  return match ? { number: match[1], text: match[2] } : null
}

/**
 * Finds page numbers in the text
 * Example: "----- Page 42 -----" -> returns 42
 */
function getPageNumber(line: string): number | null {
  const pageMatch = line.match(/^-----\s*Page\s+(\d+)\s*-----/)
  return pageMatch ? parseInt(pageMatch[1]) : null
}

/**
 * Splits the book's content into smaller, manageable chunks
 * This is necessary because AI models have a limit on how much text they can process at once
 */
function chunkContent(content: string, chunkSize: number = 500): ContentChunk[] {
  const chunks: ContentChunk[] = []
  const lines = content.split('\n')

  let currentChunk = ''
  let currentPart = 'Introduction'  // Default part
  let currentPrinciple = ''        // Current principle
  let currentPage = 1

  // Go through the book line by line
  for (const line of lines) {
    // Clean up the line (remove extra spaces, weird characters from PDF)
    const cleanLine = line.trim().replace(/\s+/g, ' ')
    if (!cleanLine) continue  // Skip empty lines

    // Check for part header
    const partHeader = isPartHeader(cleanLine)
    if (partHeader) {
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            part: currentPart,
            principle: currentPrinciple,
            pageNumber: currentPage,
            citation: `${currentPart}, Page ${currentPage}`
          }
        })
        currentChunk = ''
      }
      currentPart = partHeader
      continue
    }

    // Check for principle
    const principle = getPrinciple(cleanLine)
    if (principle) {
      if (currentChunk.trim()) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            part: currentPart,
            principle: currentPrinciple,
            pageNumber: currentPage,
            citation: `${currentPart}, Page ${currentPage}`
          }
        })
        currentChunk = ''
      }
      currentPrinciple = `Principle ${principle.number}: ${principle.text}`
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

    // Only create a new chunk if we're past the maximum size AND at a sentence boundary
    if (currentChunk.length >= chunkSize &&
      (currentChunk.trim().endsWith('.') ||
        currentChunk.trim().endsWith('?') ||
        currentChunk.trim().endsWith('!') ||
        currentChunk.trim().endsWith(']') ||
        currentChunk.trim().endsWith('"') ||
        currentChunk.trim().endsWith('”'))) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: {
          part: currentPart,
          principle: currentPrinciple,
          pageNumber: currentPage,
          // citation: `${currentPart}${currentPrinciple ? `, ${currentPrinciple}` : ''}, Page ${currentPage}`
          citation: `${currentPart}, Page ${currentPage}`
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
        part: currentPart,
        principle: currentPrinciple,
        pageNumber: currentPage,
        citation: `${currentPart}, Page ${currentPage}`
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
    console.log('Part:', match.metadata?.part)
    console.log('Principle:', match.metadata?.principle)
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
    console.log('Reading the full book file...')

    // creates a full path to where the book text is stored on local machine
    const contentPath = path.join(process.cwd(), 'data', 'carnegie-full.txt')
    // const contentPath = path.join(process.cwd(), 'data', 'carnegie-full.txt')

    // opens the book text file and reads it into a variable
    const content = fs.readFileSync(contentPath, 'utf-8')
    console.log('Successfully read the file')

    // Step 2: Split into chunks
    console.log('Splitting content into chunks...')

    //splits the book into smaller, bit sized chunks that are easy to work with
    const chunks = chunkContent(content)
    console.log(`Created ${chunks.length} chunks`)

    // Step 3: Upload each chunk
    console.log('Uploading chunks to database...')
    console.log('This may take a while, please be patient...')

    // chunks variable is an array of objects
    // loop through each object(chunk) and upload it to pinecone using the uploadChunkToVectorDB function
    for (let i = 0; i < chunks.length; i++) {
      await uploadChunkToVectorDB(chunks[i], i)
    }

    console.log('Verifying upload...')

    // ask pinecone to give us some stats abt the upload
    const stats = await pineconeIndex.describeIndexStats()
    console.log(`✓ Successfully stored ${stats.totalRecordCount} chunks in Pinecone`)

    // prints how many total chunks we stored in pinecone db
    await testPineconeContent()

    console.log('All done! The full book content is ready to be used by the AI.')
  } catch (error) {
    console.error('Something went wrong:', error)
    process.exit(1)
  }
}

// Start the process
console.log('Starting the full book upload process...')
main() 