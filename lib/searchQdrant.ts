import { QdrantClient } from '@qdrant/js-client-rest';
import { generateQueryEmbeddingOllama } from './embeddingsOllama';

const COLLECTION_NAME = 'cv_search';

let qdrantClient: QdrantClient | null = null;

function getClient(): QdrantClient {
    if (!qdrantClient) {
        qdrantClient = new QdrantClient({ url: 'http://localhost:6333' });
    }
    return qdrantClient;
}

export interface SearchResult {
    id: string;
    filename: string;
    content: string;
    similarity: number;
    language: string;
    preview: string;
}

export async function searchCVsQdrant(
    query: string,
    topK: number = 5
): Promise<SearchResult[]> {
    try {
        const client = getClient();
        const queryEmbedding = await generateQueryEmbeddingOllama(query);

        const searchResult = await client.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: topK,
            with_payload: true,
        });

        const results: SearchResult[] = searchResult.map((result: any) => ({
            id: result.payload.id,
            filename: result.payload.filename,
            content: result.payload.content,
            similarity: result.score,
            language: result.payload.language,
            preview: result.payload.content.substring(0, 200) + '...',
        }));

        return results;
    } catch (error) {
        console.error('Qdrant search error:', error);
        return [];
    }
}

export async function getStatsQdrant() {
    try {
        const client = getClient();
        const collections = await client.getCollections();
        const collection = collections.collections.find(c => c.name === COLLECTION_NAME);

        if (!collection) {
            return { totalEmbeddings: 0, provider: 'Qdrant (Local)' };
        }

        const info = await client.getCollection(COLLECTION_NAME);
        return {
            totalEmbeddings: info.points_count || 0,
            provider: 'Qdrant (Local)'
        };
    } catch (error) {
        return { totalEmbeddings: 0, provider: 'Qdrant (Local)' };
    }
}

export async function initializeQdrantCollection() {
    const client = getClient();

    try {
        await client.getCollection(COLLECTION_NAME);
        console.log('Collection already exists');
    } catch (error) {
        console.log('Creating collection...');
        await client.createCollection(COLLECTION_NAME, {
            vectors: {
                size: 768, // nomic-embed-text dimension
                distance: 'Cosine',
            },
        });
        console.log('Collection created');
    }
}