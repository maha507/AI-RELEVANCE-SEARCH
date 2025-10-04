import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const content = await file.text();
        const filename = file.name;

        // Save CV
        const cvsDir = path.join(process.cwd(), 'data', 'cvs');
        if (!fs.existsSync(cvsDir)) {
            fs.mkdirSync(cvsDir, { recursive: true });
        }

        const cvPath = path.join(cvsDir, filename);
        fs.writeFileSync(cvPath, content);

        // Generate embedding
        const embedding = await generateEmbedding(content);

        const embeddingData = {
            id: filename.replace('.txt', ''),
            filename,
            content,
            embedding,
            language: 'unknown',
        };

        const embeddingsDir = path.join(process.cwd(), 'data', 'embeddings');
        if (!fs.existsSync(embeddingsDir)) {
            fs.mkdirSync(embeddingsDir, { recursive: true });
        }

        const embeddingPath = path.join(embeddingsDir, filename.replace('.txt', '.json'));
        fs.writeFileSync(embeddingPath, JSON.stringify(embeddingData, null, 2));

        return NextResponse.json({ success: true, filename });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}