import dotenv from 'dotenv';
import { searchCVs } from '../lib/search';

dotenv.config({ path: '.env.local' });

if (!process.env.COHERE_API_KEY) {
    console.error('❌ ERROR: COHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function main() {
    console.log('🔍 Testing CV Search\n');
    console.log('='.repeat(60));

    const queries = [
        'mobile developers',
        'iOS expert',
        'Android engineer',
        'frontend developer React',
        'backend Python developer',
    ];

    for (const query of queries) {
        console.log(`\n📱 Query: "${query}"\n`);

        const results = await searchCVs(query, 5);

        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.filename}`);
            console.log(`   Similarity: ${(result.similarity * 100).toFixed(2)}%`);
            console.log(`   Language: ${result.language}`);
            console.log(`   Preview: ${result.preview.substring(0, 100)}...`);
            console.log();
        });

        console.log('-'.repeat(60));
    }
}

main();