import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { generateEmbeddingHF } from '../lib/embeddingsHuggingFace';

dotenv.config({ path: '.env.local' });

if (!process.env.HUGGINGFACE_API_KEY) {
    console.error('ERROR: HUGGINGFACE_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('HuggingFace API Key loaded successfully\n');

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('Starting HuggingFace embedding generation...\n');

    const cvsDir = path.join(process.cwd(), 'data', 'cvs');
    const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings-huggingface');

    if (!fs.existsSync(cvsDir)) {
        console.error('CVs directory not found.');
        process.exit(1);
    }

    if (!fs.existsSync(embeddingsDir)) {
        fs.mkdirSync(embeddingsDir, { recursive: true });
    }

    const files = fs.readdirSync(cvsDir).filter(f => f.endsWith('.txt'));
    console.log(`Found ${files.length} CVs to process\n`);

    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        const filepath = path.join(cvsDir, filename);
        const content = fs.readFileSync(filepath, 'utf-8');

        const languageMatch = filename.match(/_([a-z]+)_/);
        const language = languageMatch ? languageMatch[1] : 'unknown';

        try {
            const embedding = await generateEmbeddingHF(content);

            const embeddingData = {
                id: filename.replace('.txt', ''),
                filename,
                content,
                embedding,
                language,
            };

            const embeddingPath = path.join(embeddingsDir, filename.replace('.txt', '.json'));
            fs.writeFileSync(embeddingPath, JSON.stringify(embeddingData, null, 2));

            console.log(`[${i + 1}/${files.length}] ${filename}`);
            await sleep(100);
        } catch (error: any) {
            console.error(`Error processing ${filename}:`, error.message);
        }
    }

    console.log('\nHuggingFace embedding generation complete!');
}

main();