import { NextRequest, NextResponse } from 'next/server';
import { searchCVsOpenAI } from '@/lib/searchOpenAI';

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
        const results = await searchCVsOpenAI(query, limit);
        return NextResponse.json({ results, query, count: results.length, provider: 'OpenAI' });
    } catch (error) {
        console.error('OpenAI Search error:', error);
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        );
    }
}