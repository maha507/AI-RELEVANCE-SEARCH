import { NextResponse } from 'next/server';
import { getStats } from '@/lib/search';

export async function GET() {
    try {
        const stats = getStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'Failed to get stats' },
            { status: 500 }
        );
    }
}