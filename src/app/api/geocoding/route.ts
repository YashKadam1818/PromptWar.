import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/open-meteo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchLocations(q.slice(0, 80), 6);
    return NextResponse.json({ results });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to search locations' },
      { status: 500 }
    );
  }
}
