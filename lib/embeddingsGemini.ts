import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!geminiClient) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found in .env.local');
        }
        geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return geminiClient;
}

export async function generateEmbeddingGemini(text: string): Promise<number[]> {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });

    const result = await model.embedContent(text);
    return result.embedding.values;
}

export async function generateQueryEmbeddingGemini(query: string): Promise<number[]> {
    return generateEmbeddingGemini(query);
}

export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}