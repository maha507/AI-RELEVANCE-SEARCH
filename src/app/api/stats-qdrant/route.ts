import { NextResponse } from 'next/server';
import { getStatsQdrant } from '@/lib/searchQdrant';

export async function GET() {
    try {
        const stats = await getStatsQdrant();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get stats' },
            { status: 500 }
        );
    }
}