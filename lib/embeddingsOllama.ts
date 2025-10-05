import { Ollama } from 'ollama';

let ollamaClient: Ollama | null = null;

function getClient(): Ollama {
    if (!ollamaClient) {
        ollamaClient = new Ollama({ host: 'http://localhost:11434' });
    }
    return ollamaClient;
}

export async function generateEmbeddingOllama(text: string): Promise<number[]> {
    const ollama = getClient();

    const response = await ollama.embeddings({
        model: 'nomic-embed-text',
        prompt: text,
    });

    return response.embedding;
}

export async function generateQueryEmbeddingOllama(query: string): Promise<number[]> {
    return generateEmbeddingOllama(query);
}

export function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}