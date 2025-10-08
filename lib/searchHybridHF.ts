import fs from 'fs';
import path from 'path';
import { CohereClient } from 'cohere-ai';
import { cosineSimilarity, generateQueryEmbeddingHF } from './embeddingsHuggingFace';

interface CVDataHF {
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
    rerankScore?: number;
    embeddingScore?: number;
}

let cohereClient: CohereClient | null = null;

function getCohereClient(): CohereClient {
    if (!cohereClient) {
        if (!process.env.COHERE_API_KEY) {
            throw new Error('COHERE_API_KEY not found');
        }
        cohereClient = new CohereClient({
            token: process.env.COHERE_API_KEY,
        });
    }
    return cohereClient;
}

export async function searchHybridHF(
    query: string,
    topK: number = 5
): Promise<SearchResult[]> {
    // Stage 1: HuggingFace Embedding Search (retrieve top 20)
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings-huggingface');

    if (!fs.existsSync(embeddingsDir)) {
        throw new Error('HuggingFace embeddings not found. Run: npm run generate-embeddings-hf');
    }

    const queryEmbedding = await generateQueryEmbeddingHF(query);
    const files = fs.readdirSync(embeddingsDir).filter(f => f.endsWith('.json'));

    const candidates: SearchResult[] = [];

    for (const file of files) {
        const filePath = path.join(embeddingsDir, file);
        const data: CVDataHF = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const similarity = cosineSimilarity(queryEmbedding, data.embedding);

        candidates.push({
            id: data.id,
            filename: data.filename,
            content: data.content,
            similarity,
            language: data.language,
            preview: data.content.substring(0, 200) + '...',
            embeddingScore: similarity,
        });
    }

    // Get top 20 candidates from embedding search
    const topCandidates = candidates
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 20);

    // Stage 2: Cohere Rerank (rerank top 20 to get final top K)
    const cohere = getCohereClient();
    const documents = topCandidates.map(c => c.content);

    const rerankResponse = await cohere.rerank({
        query: query,
        documents: documents,
        topN: topK,
        model: 'rerank-english-v3.0',
    });

    // Map reranked results back to candidates
    const rerankedResults: SearchResult[] = rerankResponse.results.map((result) => {
        const originalCandidate = topCandidates[result.index];
        return {
            ...originalCandidate,
            rerankScore: result.relevanceScore,
            similarity: result.relevanceScore, // Use rerank score as primary similarity
        };
    });

    return rerankedResults;
}

export function getStatsHybridHF() {
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings-huggingface');
    const totalEmbeddings = fs.existsSync(embeddingsDir)
        ? fs.readdirSync(embeddingsDir).filter(f => f.endsWith('.json')).length
        : 0;

    return {
        totalEmbeddings,
        provider: 'Hybrid (HuggingFace + Cohere)',
        stage1: 'HuggingFace all-MiniLM-L6-v2',
        stage2: 'Cohere rerank-v3.0',
    };
}