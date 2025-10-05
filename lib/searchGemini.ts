import fs from 'fs';
import path from 'path';
import { cosineSimilarity, generateQueryEmbeddingGemini } from './embeddingsGemini';

export interface CVDataGemini {
    id: string;
    filename: string;
    content: string;
    embedding: number[];
    language: string;
}

export interface SearchResult {
    id: string;
    filename: string;
    content: string;
    similarity: number;
    language: string;
    preview: string;
}

export async function searchCVsGemini(
    query: string,
    topK: number = 5
): Promise<SearchResult[]> {
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings-gemini');

    if (!fs.existsSync(embeddingsDir)) {
        return [];
    }

    const queryEmbedding = await generateQueryEmbeddingGemini(query);
    const files = fs.readdirSync(embeddingsDir).filter(f => f.endsWith('.json'));
    const results: SearchResult[] = [];

    for (const file of files) {
        const filePath = path.join(embeddingsDir, file);
        const data: CVDataGemini = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const similarity = cosineSimilarity(queryEmbedding, data.embedding);

        results.push({
            id: data.id,
            filename: data.filename,
            content: data.content,
            similarity,
            language: data.language,
            preview: data.content.substring(0, 200) + '...',
        });
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

export function getStatsGemini() {
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings-gemini');
    const totalEmbeddings = fs.existsSync(embeddingsDir)
        ? fs.readdirSync(embeddingsDir).filter(f => f.endsWith('.json')).length
        : 0;

    return { totalEmbeddings, provider: 'Google Gemini' };
}