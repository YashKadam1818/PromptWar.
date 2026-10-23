import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironmentalData, verifyAgentOutput } from '../src/lib/validator';
import { 
  ValidatedEnvironmentalData, 
  RiskAssessment, 
  GeminiAdvisoryRecommendation 
} from '../src/types/environmental';

describe('Validator and Verification Engine', () => {
  const validMockData: ValidatedEnvironmentalData = {
    location: {
      name: 'Hinjawadi, PCMC',
      latitude: 18.5913,
      longitude: 73.7389,
    },
    retrievedAt: new Date().toISOString(),
    dataTimestamp: new Date().toISOString(),
    dataSource: {
      provider: 'Open-Meteo',
      model: 'CAMS Ensemble',
      classification: 'Modelled Forecast',
      disclaimer: 'Disclaimer test',
    },
    current: {
      pm25: 38,
      pm10: 75,
      no2: 22,
      so2: 8,
      ozone: 40,
      co: 450,
      usAqi: 107,
      europeanAqi: 45,
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
      { timestamp: '2026-10-23T14:00', pm25: 38, pm10: 75, usAqi: 107, europeanAqi: 45, ozone: 40, no2: 22 },
      { timestamp: '2026-10-23T15:00', pm25: 42, pm10: 80, usAqi: 117, europeanAqi: 48, ozone: 42, no2: 24 },
    ],
  };

  test('validateEnvironmentalData passes valid atmospheric data', () => {
    const res = validateEnvironmentalData(validMockData);
    assert.equal(res.isValid, true);
    assert.equal(res.issues.length, 0);
  });

  test('validateEnvironmentalData flags out-of-bounds coordinates', () => {
    const corruptedData: ValidatedEnvironmentalData = {
      ...validMockData,
      location: {
        name: 'Invalid Pole',
        latitude: 195.0, // Invalid: latitude must be between -90 and 90
        longitude: 73.7389,
      },
    };

    const res = validateEnvironmentalData(corruptedData);
    assert.equal(res.isValid, false);
    assert.ok(res.issues.some((issue) => issue.includes('Latitude out of valid physical range')));
  });

  test('validateEnvironmentalData flags negative or absurd atmospheric values', () => {
    const corruptedData: ValidatedEnvironmentalData = {
      ...validMockData,
      current: {
        ...validMockData.current,
        pm25: -10, // Invalid physical reading
        usAqi: 2500, // Invalid EPA scale reading
      },
    };

    const res = validateEnvironmentalData(corruptedData);
    assert.equal(res.isValid, false);
    assert.ok(res.issues.some((issue) => issue.includes('outside physical atmospheric limits')));
    assert.ok(res.issues.some((issue) => issue.includes('outside valid scale limits')));
  });

  test('verifyAgentOutput detects health direction contradictions', () => {
    const highRisk: RiskAssessment = {
      overallRiskLevel: 'Very Unhealthy',
      usAqi: 240,
      europeanAqi: 95,
      dominantPollutant: 'PM2.5',
      dominantPollutantValue: 85,
      dominantPollutantUnit: 'µg/m³',
      whoExceedanceFactor: { pm25: 5.6, pm10: 2.1, no2: 1.2 },
      sensitiveGroupImpacts: [],
      peakForecastHours: [],
      calculatedAt: new Date().toISOString(),
    };

    const contradictoryAdvisory: GeminiAdvisoryRecommendation = {
      summary: 'The air is refreshing today. Outdoor sports encouraged for all schools!',
      sourceAttribution: 'Test Attribution',
      isAIGenerated: true,
      modelIdentifier: 'Gemini 3.8 Flash',
      cohortActions: {
        schoolsAndChildren: ['outdoor sports encouraged for everyone'],
        respiratoryAndElderly: ['Take long deep outdoor walks'],
        outdoorWorkers: ['No precautions needed'],
        civicAuthorities: ['Normal operations'],
      },
      municipalMitigations: ['None'],
      evidenceGroundedCitations: ['PM2.5: 85 µg/m³'],
    };

    const report = verifyAgentOutput(contradictoryAdvisory, highRisk, validMockData);
    assert.equal(report.isVerified, false);
    assert.ok(report.anomaliesDetected.some((a) => a.includes('Advisory contradicts high pollution')));
  });

  test('verifyAgentOutput validates well-grounded advisory', () => {
    const moderateRisk: RiskAssessment = {
      overallRiskLevel: 'Moderate',
      usAqi: 75,
      europeanAqi: 35,
      dominantPollutant: 'PM2.5',
      dominantPollutantValue: 24,
      dominantPollutantUnit: 'µg/m³',
      whoExceedanceFactor: { pm25: 1.6, pm10: 1.0, no2: 0.8 },
      sensitiveGroupImpacts: [],
      peakForecastHours: [],
      calculatedAt: new Date().toISOString(),
    };

    const groundedAdvisory: GeminiAdvisoryRecommendation = {
      summary: 'Moderate air quality in Hinjawadi driven by PM2.5 at 24 µg/m³. Standard outdoor activities are safe.',
      sourceAttribution: 'Open-Meteo & Gemini 3.8 Flash',
      isAIGenerated: true,
      modelIdentifier: 'Gemini 3.8 Flash',
      cohortActions: {
        schoolsAndChildren: ['Standard outdoor recess permitted.'],
        respiratoryAndElderly: ['Maintain regular inhalers for sensitive individuals.'],
        outdoorWorkers: ['Standard shift hydration breaks.'],
        civicAuthorities: ['Routine dust suppression along major roads.'],
      },
      municipalMitigations: ['Sprinkle water on unpaved shoulders.'],
      evidenceGroundedCitations: ['PM2.5: 24 µg/m³ (1.6x WHO guideline)', 'US AQI: 75'],
    };

    const report = verifyAgentOutput(groundedAdvisory, moderateRisk, validMockData);
    assert.equal(report.isVerified, true);
    assert.equal(report.anomaliesDetected.length, 0);
  });
});
