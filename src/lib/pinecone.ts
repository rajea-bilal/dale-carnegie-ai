import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('Missing Pinecone API key');
}

if (!process.env.PINECONE_ENVIRONMENT) {
  throw new Error('Missing Pinecone environment');
}

if (!process.env.PINECONE_INDEX) {
  throw new Error('Missing Pinecone index name');
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const index = pinecone.index(process.env.PINECONE_INDEX); 