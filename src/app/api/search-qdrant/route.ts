import { NextRequest, NextResponse } from 'next/server';
import { searchCVsQdrant } from '@/lib/searchQdrant';

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
        const results = await searchCVsQdrant(query, limit);
        return NextResponse.json({
            results,
            query,
            count: results.length,
            provider: 'Qdrant + Ollama'
        });
    } catch (error) {
        console.error('Qdrant Search error:', error);
        return NextResponse.json(
            { error: 'Search failed. Make sure Ollama and Qdrant are running.' },
            { status: 500 }
        );
    }
}