import { NextResponse } from 'next/server';
import { getStatsHF } from '@/lib/searchHuggingFace';

export async function GET() {
    try {
        const stats = getStatsHF();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get stats' },
            { status: 500 }
        );
    }
}