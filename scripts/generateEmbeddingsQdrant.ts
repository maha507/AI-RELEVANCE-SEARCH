import fs from 'fs';
import path from 'path';
import { QdrantClient } from '@qdrant/js-client-rest';
import { generateEmbeddingOllama } from '../lib/embeddingsOllama';
import { initializeQdrantCollection } from '../lib/searchQdrant';

const COLLECTION_NAME = 'cv_search';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('🚀 Starting Qdrant/Ollama embedding generation...\n');

    const client = new QdrantClient({ url: 'http://localhost:6333' });

    // Initialize collection
    await initializeQdrantCollection();

    const cvsDir = path.join(process.cwd(), 'data', 'cvs');

    if (!fs.existsSync(cvsDir)) {
        console.error('❌ CVs directory not found.');
        process.exit(1);
    }

    const files = fs.readdirSync(cvsDir).filter(f => f.endsWith('.txt'));
    console.log(`Found ${files.length} CVs to process\n`);

    const points = [];

    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const filepath = path.join(cvsDir, filename);
        const content = fs.readFileSync(filepath, 'utf-8');

        const languageMatch = filename.match(/_([a-z]+)_/);
        const language = languageMatch ? languageMatch[1] : 'unknown';

        try {
            console.log(`⏳ [${i + 1}/${files.length}] Processing ${filename}...`);
            const embedding = await generateEmbeddingOllama(content);

            points.push({
                id: i + 1,
                vector: embedding,
                payload: {
                    id: filename.replace('.txt', ''),
                    filename,
                    content,
                    language,
                },
            });

            console.log(`✓ [${i + 1}/${files.length}] ${filename}`);

            // Batch insert every 10 documents
            if (points.length >= 10) {
                await client.upsert(COLLECTION_NAME, {
                    wait: true,
                    points: points,
                });
                console.log(`📦 Uploaded batch of ${points.length} embeddings\n`);
                points.length = 0; // Clear array
            }

            await sleep(100);
        } catch (error: any) {
            console.error(`✗ Error processing ${filename}:`, error.message);
        }
    }

    // Insert remaining points
    if (points.length > 0) {
        await client.upsert(COLLECTION_NAME, {
            wait: true,
            points: points,
        });
        console.log(`📦 Uploaded final batch of ${points.length} embeddings\n`);
    }

    const info = await client.getCollection(COLLECTION_NAME);
    console.log(`\n✅ Qdrant embedding generation complete!`);
    console.log(`📊 Total vectors in collection: ${info.points_count}`);
}

main();