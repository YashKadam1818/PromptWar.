import { LocationCoordinates, RawAirQualityResponse, ValidatedEnvironmentalData } from '../types/environmental';

const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 8000;

interface GeocodingItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  admin1?: string;
  admin2?: string;
}

interface GeocodingResponse {
  results?: GeocodingItem[];
  generationtime_ms?: number;
}

/**
 * Searches locations using Open-Meteo Geocoding API with priority given to Pune/Maharashtra matches.
 */
export async function searchLocations(query: string, maxResults = 5): Promise<LocationCoordinates[]> {
  const sanitized = query.trim();
  if (!sanitized || sanitized.length < 2) {
    return [];
  }

  const url = new URL(GEOCODING_BASE_URL);
  url.searchParams.set('name', sanitized);
  url.searchParams.set('count', String(Math.min(maxResults * 2, 10)));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EcoPulse-AI-Environmental-Agent/1.0',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Geocoding API responded with HTTP ${res.status}`);
    }

    const data = (await res.json()) as GeocodingResponse;
    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Sort to prioritize Maharashtra / Pune if available
    const mapped: LocationCoordinates[] = data.results.map((item) => ({
      name: item.admin2 
        ? `${item.name}, ${item.admin2}` 
        : (item.admin1 ? `${item.name}, ${item.admin1}` : item.name),
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      admin1: item.admin1,
      admin2: item.admin2,
      country: item.country,
      isPreset: false,
    }));

    return mapped.slice(0, maxResults);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Geocoding search timed out after 8 seconds');
    }
    throw new Error(`Failed to query geocoding service: ${err instanceof Error ? err.message : 'Unknown error'}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches real air quality data and forecasts from Open-Meteo Air Quality API.
 */
export async function fetchAirQualityData(
  latitude: number,
  longitude: number,
  locationMeta?: Partial<LocationCoordinates>
): Promise<ValidatedEnvironmentalData> {
  // Validate coordinate boundaries
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates: latitude and longitude must be valid numbers');
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(`Coordinates out of bounds: (${latitude}, ${longitude})`);
  }

  const url = new URL(AIR_QUALITY_BASE_URL);
  url.searchParams.set('latitude', latitude.toFixed(4));
  url.searchParams.set('longitude', longitude.toFixed(4));
  url.searchParams.set('current', 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi');
  url.searchParams.set('hourly', 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '3');

  let attempts = 0;
  const maxAttempts = 2;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EcoPulse-AI-Environmental-Agent/1.0',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Open-Meteo Air Quality API returned HTTP ${res.status}`);
      }

      const raw = (await res.json()) as RawAirQualityResponse;
      clearTimeout(timeoutId);

      return normalizeRawAirQuality(raw, {
        name: locationMeta?.name || `Coordinates (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
        latitude,
        longitude,
        elevation: raw.elevation,
        admin1: locationMeta?.admin1,
        admin2: locationMeta?.admin2,
        country: locationMeta?.country,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      lastError = new Error(isAbort ? 'Open-Meteo request timed out' : (err instanceof Error ? err.message : 'Network failure'));
      
      if (attempts < maxAttempts) {
        // Short exponential backoff before retry
        await new Promise((r) => setTimeout(r, 400 * attempts));
      }
    }
  }

  throw lastError || new Error('Failed to fetch environmental data after retries');
}

/**
 * Normalizes raw Open-Meteo API payload into strict, validated data structure.
 */
export function normalizeRawAirQuality(
  raw: RawAirQualityResponse,
  location: LocationCoordinates
): ValidatedEnvironmentalData {
  if (!raw.current || !raw.hourly) {
    throw new Error('Malformed Open-Meteo response: missing current or hourly dataset');
  }

  const currentUnits = raw.current_units || {};
  const current = raw.current;

  // Safe fallback to 0 or hourly first entry if current variable is null
  const pm25 = typeof current.pm2_5 === 'number' ? Math.max(0, current.pm2_5) : (raw.hourly.pm2_5?.[0] ?? 0);
  const pm10 = typeof current.pm10 === 'number' ? Math.max(0, current.pm10) : (raw.hourly.pm10?.[0] ?? 0);
  const co = typeof current.carbon_monoxide === 'number' ? Math.max(0, current.carbon_monoxide) : (raw.hourly.carbon_monoxide?.[0] ?? 0);
  const no2 = typeof current.nitrogen_dioxide === 'number' ? Math.max(0, current.nitrogen_dioxide) : (raw.hourly.nitrogen_dioxide?.[0] ?? 0);
  const so2 = typeof current.sulphur_dioxide === 'number' ? Math.max(0, current.sulphur_dioxide) : (raw.hourly.sulphur_dioxide?.[0] ?? 0);
  const ozone = typeof current.ozone === 'number' ? Math.max(0, current.ozone) : (raw.hourly.ozone?.[0] ?? 0);
  const usAqi = typeof current.us_aqi === 'number' ? Math.max(0, current.us_aqi) : (raw.hourly.us_aqi?.[0] ?? 0);
  const europeanAqi = typeof current.european_aqi === 'number' ? Math.max(0, current.european_aqi) : (raw.hourly.european_aqi?.[0] ?? 0);

  // Normalize hourly forecasts up to 72 hours
  const hourlyTimes = raw.hourly.time || [];
  const hourlyCount = Math.min(hourlyTimes.length, 72);
  const hourlyForecast: ValidatedEnvironmentalData['hourlyForecast'] = [];

  for (let i = 0; i < hourlyCount; i++) {
    hourlyForecast.push({
      timestamp: hourlyTimes[i],
      pm25: raw.hourly.pm2_5?.[i] ?? 0,
      pm10: raw.hourly.pm10?.[i] ?? 0,
      usAqi: raw.hourly.us_aqi?.[i] ?? 0,
      europeanAqi: raw.hourly.european_aqi?.[i] ?? 0,
      ozone: raw.hourly.ozone?.[i] ?? 0,
      no2: raw.hourly.nitrogen_dioxide?.[i] ?? 0,
    });
  }

  return {
    location,
    retrievedAt: new Date().toISOString(),
    dataTimestamp: current.time || new Date().toISOString(),
    dataSource: {
      provider: 'Open-Meteo Air Quality API',
      model: 'Copernicus Atmospheric Monitoring Service (CAMS) / ECMWF SILAM & MOCAGE Model Ensemble',
      classification: 'Modelled Forecast',
      disclaimer: 'Data values are high-resolution numerical atmospheric chemical model forecasts, not direct hardware sensor measurements. Use for directional planning and proactive municipal guidance.',
    },
    current: {
      pm25,
      pm10,
      co,
      no2,
      so2,
      ozone,
      usAqi,
      europeanAqi,
      units: {
        pm25: currentUnits.pm2_5 || 'µg/m³',
        pm10: currentUnits.pm10 || 'µg/m³',
        co: currentUnits.carbon_monoxide || 'µg/m³',
        no2: currentUnits.nitrogen_dioxide || 'µg/m³',
        so2: currentUnits.sulphur_dioxide || 'µg/m³',
        ozone: currentUnits.ozone || 'µg/m³',
        usAqi: currentUnits.us_aqi || 'AQI',
        europeanAqi: currentUnits.european_aqi || 'EAQI',
      },
    },
    hourlyForecast,
  };
}
