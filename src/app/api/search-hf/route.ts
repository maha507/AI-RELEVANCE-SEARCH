import { NextRequest, NextResponse } from 'next/server';
import { searchCVsHF } from '@/lib/searchHuggingFace';

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
        const results = await searchCVsHF(query, limit);
        return NextResponse.json({ results, query, count: results.length, provider: 'HuggingFace' });
    } catch (error) {
        console.error('HuggingFace Search error:', error);
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        );
    }
}