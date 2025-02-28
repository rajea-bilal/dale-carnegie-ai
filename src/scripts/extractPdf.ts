import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Extracts text from a PDF file and saves it to a text file
 * This script will:
 * 1. Read the PDF file
 * 2. Extract all text content
 * 3. Process the text to identify page numbers and chapters
 * 4. Save the processed text to a file in the data folder
 */
async function extractPdfText() {
  try {
    console.log('📚 Starting PDF extraction process...');
    
    // full path to the pdf file where the book is stored
    const pdfPath = path.join(process.cwd(), 'data', 'how-to-win-friends-and-influence-people.pdf');
    console.log(`Reading PDF from: ${pdfPath}`);
    
    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }
    
    // Read the PDF file
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log(`PDF file size: ${(dataBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Extract the entire document with standard options
    console.log('Extracting text from PDF...');
    const data = await pdfParse(dataBuffer, { max: 0 });
    let extractedText = data.text;
    
    if (extractedText.trim().length < 1000) {
      console.log('⚠️ Warning: Very little text was extracted. This might be a scanned PDF.');
      console.log('Sample of extracted text:');
      console.log(extractedText.substring(0, 200));
      
      console.log('The PDF might be protected or in a format that pdf-parse cannot handle.');
      console.log('You may need to use a different PDF extraction tool or OCR service.');
      return;
    }
    
    console.log(`Extracted ${extractedText.length} characters of text.`);
    
    // Process the text to clean it up
    // Remove excessive whitespace
    let processedText = extractedText
      .replace(/\n{3,}/g, '\n\n')  // Replace 3+ consecutive newlines with 2
      .trim();
    
    // Try to identify original page numbers in the text
    console.log('Attempting to identify original page numbers in the text...');
    
    // First, check if the text already contains page numbers
    const pageNumberRegex = /\n\s*(\d+)\s*\n|\n\s*Page\s+(\d+)\s*\n/g;
    let match;
    let pageMatches = [];
    
    // Collect all potential page numbers
    while ((match = pageNumberRegex.exec(processedText)) !== null) {
      const pageNumber = parseInt(match[1] || match[2]);
      // Only consider reasonable page numbers
      if (pageNumber > 0 && pageNumber <= data.numpages + 20) {
        pageMatches.push({
          pageNumber,
          index: match.index,
          length: match[0].length
        });
      }
    }
    
    // If we found potential page numbers
    if (pageMatches.length > 0) {
      console.log(`Found ${pageMatches.length} potential page numbers in the text`);
      
      // Sort by index to process in order
      pageMatches.sort((a, b) => a.index - b.index);
      
      // Build text with page markers
      let textWithPageMarkers = '';
      let lastIndex = 0;
      
      for (const match of pageMatches) {
        // Add text before this page number with the page marker
        // Add more spacing between page number and content for better readability
        textWithPageMarkers += processedText.substring(lastIndex, match.index) + `\n\n----- Page ${match.pageNumber} -----\n\n`;
        lastIndex = match.index + match.length;
      }
      
      // Add the remaining text
      textWithPageMarkers += processedText.substring(lastIndex);
      
      processedText = textWithPageMarkers;
    } else {
      console.log('Could not identify original page numbers. Using chapter headings and content structure...');
      
      // Look for chapter headings to help with structure
      const chapterRegex = /\n\s*(Chapter\s+\d+[^]*?)(?=\n\s*Chapter\s+\d+|\n\s*Appendix|\n\s*Index|$)/gi;
      const chapters = [];
      let chapterMatch;
      
      while ((chapterMatch = chapterRegex.exec(processedText)) !== null) {
        chapters.push(chapterMatch[1].trim());
      }
      
      if (chapters.length > 0) {
        console.log(`Found ${chapters.length} chapters in the text`);
        
        // Estimate pages per chapter based on total pages
        const pagesPerChapter = Math.floor(data.numpages / chapters.length);
        
        // Build text with estimated page numbers
        let textWithPageEstimates = '';
        for (let i = 0; i < chapters.length; i++) {
          const startPage = i * pagesPerChapter + 1;
          // Add more spacing and formatting for page numbers
          textWithPageEstimates += `\n\n----- Page ${startPage} -----\n\n${chapters[i]}\n\n`;
        }
        
        processedText = textWithPageEstimates;
      } else {
        console.log('No chapters found. Adding arbitrary page markers based on content...');
        
        // Split by some heuristic (e.g., paragraphs) to identify potential page breaks
        const paragraphs = processedText.split(/\n\n(?=\S)/);
        
        // Estimate how many paragraphs per page based on total pages
        const paragraphsPerPage = Math.ceil(paragraphs.length / data.numpages);
        
        // Build text with estimated page numbers
        let textWithPageEstimates = '';
        for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
          const pageNumber = Math.floor(i / paragraphsPerPage) + 1;
          const pageContent = paragraphs.slice(i, i + paragraphsPerPage).join('\n\n');
          // Add more spacing and formatting for page numbers
          textWithPageEstimates += `\n\n----- Page ${pageNumber} -----\n\n${pageContent}\n\n`;
        }
        
        processedText = textWithPageEstimates;
      }
    }
    
    // path created for the output text file where the book text will be stored
    const outputPath = path.join(process.cwd(), 'data', 'carnegie-full.txt');

    // write the extracted text to the output file
    fs.writeFileSync(outputPath, processedText);
    
    console.log(`✅ Text saved to ${outputPath}`);
    console.log('You can now run the uploadContent.ts script with this file');
    
    // Print some stats
    console.log('\nExtraction Stats:');
    console.log(`Total Pages: ${data.numpages}`);
    console.log(`Total Characters: ${processedText.length}`);
    console.log(`Approximate Words: ${processedText.split(/\s+/).length}`);
    
    // Sample the beginning of the extracted text
    console.log('\nSample of extracted text:');
    console.log(processedText.substring(0, 500) + '...');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error extracting text from PDF:', errorMessage);
    process.exit(1);
  }
}

// Run the extraction
console.log('Starting PDF text extraction...');
extractPdfText(); 