import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQualityData } from '@/lib/open-meteo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  const name = searchParams.get('name') || undefined;

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'Missing lat or lon query parameter' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid coordinate values' }, { status: 400 });
  }

  try {
    const data = await fetchAirQualityData(lat, lon, { name });
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to retrieve air quality data' },
      { status: 500 }
    );
  }
}
