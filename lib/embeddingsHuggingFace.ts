import { HfInference } from '@huggingface/inference';

let hfClient: HfInference | null = null;

function getClient(): HfInference {
    if (!hfClient) {
        if (!process.env.HUGGINGFACE_API_KEY) {
            throw new Error('HUGGINGFACE_API_KEY not found in .env.local');
        }
        hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }
    return hfClient;
}

export async function generateEmbeddingHF(text: string): Promise<number[]> {
    const hf = getClient();

    const response = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
    });

    return Array.isArray(response) ? response : [];
}

export async function generateQueryEmbeddingHF(query: string): Promise<number[]> {
    return generateEmbeddingHF(query);
}

export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}