import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EcoPulseAgentOrchestrator } from '../src/lib/agent/orchestrator';
import { buildDeterministicAdvisory } from '../src/lib/agent/gemini';
import { ValidatedEnvironmentalData, RiskAssessment } from '../src/types/environmental';
import { DEFAULT_LOCATION } from '../src/lib/pune-regions';

describe('Agent Bounds and Invariant Enforcement', () => {
  const mockData: ValidatedEnvironmentalData = {
    location: DEFAULT_LOCATION,
    retrievedAt: new Date().toISOString(),
    dataTimestamp: new Date().toISOString(),
    dataSource: {
      provider: 'Open-Meteo',
      model: 'CAMS Ensemble',
      classification: 'Modelled Forecast',
      disclaimer: 'Modelled atmospheric data',
    },
    current: {
      pm25: 58,
      pm10: 105,
      no2: 34,
      so2: 14,
      ozone: 48,
      co: 700,
      usAqi: 152,
      europeanAqi: 62,
      units: {
        pm25: 'µg/m³',
        pm10: 'µg/m³',
        no2: 'µg/m³',
        so2: 'µg/m³',
        ozone: 'µg/m³',
        co: 'µg/m³',
        usAqi: 'AQI',
        europeanAqi: 'EAQI',
      },
    },
    hourlyForecast: [
      { timestamp: '2026-10-23T14:00', pm25: 58, pm10: 105, usAqi: 152, europeanAqi: 62, ozone: 48, no2: 34 },
    ],
  };

  const mockRisk: RiskAssessment = {
    overallRiskLevel: 'Unhealthy',
    usAqi: 152,
    europeanAqi: 62,
    dominantPollutant: 'PM2.5',
    dominantPollutantValue: 58,
    dominantPollutantUnit: 'µg/m³',
    whoExceedanceFactor: { pm25: 3.9, pm10: 2.3, no2: 1.4 },
    sensitiveGroupImpacts: [],
    peakForecastHours: [],
    calculatedAt: new Date().toISOString(),
  };

  test('Orchestrator enforces maximum 7 total workflow stages and max 2 retries', () => {
    const orchestrator = new EcoPulseAgentOrchestrator();
    const state = orchestrator.getState();

    assert.equal(state.totalStages, 7);
    assert.equal(state.maxRetries, 2);
    assert.equal(state.retryCount, 0);
    assert.equal(state.stagesCompleted, 0);
  });

  test('buildDeterministicAdvisory builds valid grounded output without API key', () => {
    const advisory = buildDeterministicAdvisory(mockData, mockRisk);

    assert.equal(advisory.isAIGenerated, false);
    assert.ok(advisory.modelIdentifier.includes('Deterministic Rules Engine'));
    assert.ok(advisory.summary.includes('Shivajinagar, Pune'));
    assert.ok(advisory.summary.includes('152'));

    // Check all demographic cohorts have guidance
    assert.ok(advisory.cohortActions.schoolsAndChildren.length > 0);
    assert.ok(advisory.cohortActions.respiratoryAndElderly.length > 0);
    assert.ok(advisory.cohortActions.outdoorWorkers.length > 0);
    assert.ok(advisory.cohortActions.civicAuthorities.length > 0);
    assert.ok(advisory.municipalMitigations.length > 0);
    assert.ok(advisory.evidenceGroundedCitations.length > 0);
  });

  test('Deterministic advisory quotes exact numerical values from data', () => {
    const advisory = buildDeterministicAdvisory(mockData, mockRisk);
    const citations = advisory.evidenceGroundedCitations.join(' ');

    assert.ok(citations.includes('152'));
    assert.ok(citations.includes('58 µg/m³'));
    assert.ok(citations.includes('105 µg/m³'));
    assert.ok(citations.includes('3.9x'));
  });
});
