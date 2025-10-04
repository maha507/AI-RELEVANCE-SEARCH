import { CohereClient } from 'cohere-ai';

// Lazy initialization - create client only when needed
let cohereClient: CohereClient | null = null;

function getClient(): CohereClient {
    if (!cohereClient) {
        if (!process.env.COHERE_API_KEY) {
            throw new Error(
                'COHERE_API_KEY not found. Make sure .env.local exists with your API key.'
            );
        }
        cohereClient = new CohereClient({
            token: process.env.COHERE_API_KEY,
        });
    }
    return cohereClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const cohere = getClient();

    const response = await cohere.embed({
        texts: [text],
        model: 'embed-english-v3.0',
        inputType: 'search_document',
    });

    return response.embeddings[0];
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
    const cohere = getClient();

    const response = await cohere.embed({
        texts: [query],
        model: 'embed-english-v3.0',
        inputType: 'search_query',
    });

    return response.embeddings[0];
}

export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}