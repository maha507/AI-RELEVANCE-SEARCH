import { NextResponse } from 'next/server';
import { getStatsOpenAI } from '@/lib/searchGemini';

export async function GET() {
    try {
        const stats = getStatsOpenAI();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get stats' },
            { status: 500 }
        );
    }
}