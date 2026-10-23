import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRawAirQuality, fetchAirQualityData } from '../src/lib/open-meteo';
import { RawAirQualityResponse } from '../src/types/environmental';
import { DEFAULT_LOCATION } from '../src/lib/pune-regions';

describe('API Failure and Fault Tolerance Tests', () => {
  test('normalizeRawAirQuality gracefully handles null or missing pollutant values', () => {
    const rawWithNulls: RawAirQualityResponse = {
      latitude: 18.53,
      longitude: 73.84,
      generationtime_ms: 1.2,
      utc_offset_seconds: 19800,
      timezone: 'IST',
      timezone_abbreviation: 'IST',
      elevation: 560,
      current_units: {},
      current: {
        time: '2026-10-23T14:00',
        interval: 3600,
        pm2_5: undefined, // Missing
        pm10: undefined,  // Missing
        us_aqi: undefined, // Missing
      },
      hourly_units: {},
      hourly: {
        time: ['2026-10-23T14:00'],
        pm2_5: [null],
        pm10: [null],
        us_aqi: [null],
      },
    };

    const normalized = normalizeRawAirQuality(rawWithNulls, DEFAULT_LOCATION);
    assert.equal(normalized.current.pm25, 0);
    assert.equal(normalized.current.pm10, 0);
    assert.equal(normalized.current.usAqi, 0);
    assert.equal(normalized.hourlyForecast[0].pm25, 0);
  });

  test('normalizeRawAirQuality rejects completely missing hourly or current datasets', () => {
    const malformedPayload = {} as RawAirQualityResponse;
    assert.throws(() => {
      normalizeRawAirQuality(malformedPayload, DEFAULT_LOCATION);
    }, /missing current or hourly dataset/);
  });

  test('fetchAirQualityData rejects invalid coordinates before making network call', async () => {
    await assert.rejects(async () => {
      await fetchAirQualityData(NaN, 73.84);
    }, /Invalid coordinates/);

    await assert.rejects(async () => {
      await fetchAirQualityData(105.0, 73.84); // Out of bounds
    }, /Coordinates out of bounds/);
  });
});
