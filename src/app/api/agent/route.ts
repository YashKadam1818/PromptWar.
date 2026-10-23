import { NextRequest, NextResponse } from 'next/server';
import { EcoPulseAgentOrchestrator } from '@/lib/agent/orchestrator';
import { LocationCoordinates } from '@/types/environmental';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const location = body.location as LocationCoordinates | undefined;
    const searchQuery = body.searchQuery as string | undefined;

    // Validate location if provided
    if (location) {
      if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        return NextResponse.json(
          { error: 'Invalid location parameters: latitude and longitude are required numbers.' },
          { status: 400 }
        );
      }
      if (location.latitude < -90 || location.latitude > 90 || location.longitude < -180 || location.longitude > 180) {
        return NextResponse.json(
          { error: 'Location coordinates are out of valid range.' },
          { status: 400 }
        );
      }
    }

    if (searchQuery && typeof searchQuery !== 'string') {
      return NextResponse.json(
        { error: 'Invalid search query parameter.' },
        { status: 400 }
      );
    }

    const orchestrator = new EcoPulseAgentOrchestrator();
    const result = await orchestrator.execute({
      location,
      searchQuery: searchQuery?.slice(0, 100), // Bound length
    });

    return NextResponse.json(result, {
      status: result.status === 'error' ? 500 : 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    console.error('Agent route error:', err);
    return NextResponse.json(
      { 
        error: 'An internal agent processing error occurred. Please retry.',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
