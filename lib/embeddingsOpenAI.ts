import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
    if (!openaiClient) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not found in .env.local');
        }
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiClient;
}

export async function generateEmbeddingOpenAI(text: string): Promise<number[]> {
    const openai = getClient();

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });

    return response.data[0].embedding;
}

export async function generateQueryEmbeddingOpenAI(query: string): Promise<number[]> {
    return generateEmbeddingOpenAI(query);
}

export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}