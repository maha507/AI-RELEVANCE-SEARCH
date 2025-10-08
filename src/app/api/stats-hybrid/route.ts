import { NextResponse } from 'next/server';
import { getStatsHybridHF } from '@/lib/searchHybridHF';

export async function GET() {
    try {
        const stats = getStatsHybridHF();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { totalEmbeddings: 0, provider: 'Hybrid', error: 'Stats unavailable' },
            { status: 200 }
        );
    }
}