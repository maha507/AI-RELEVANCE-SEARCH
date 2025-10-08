import { NextRequest, NextResponse } from 'next/server';
import { searchHybridHF } from '@/lib/searchHybridHF';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
        return NextResponse.json(
            { error: 'Query parameter "q" is required' },
            { status: 400 }
        );
    }

    try {
        const results = await searchHybridHF(query, limit);
        return NextResponse.json({
            results,
            query,
            count: results.length,
            provider: 'Hybrid (HuggingFace + Cohere)',
            method: '2-Stage: Embedding Retrieval + Reranking'
        });
    } catch (error: any) {
        console.error('Hybrid Search error:', error);
        return NextResponse.json(
            { error: error.message || 'Search failed' },
            { status: 500 }
        );
    }
}