import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  categorizeAQI, 
  identifyDominantPollutant, 
  evaluateSensitiveGroupImpacts,
  calculateEnvironmentalRisk
} from '../src/lib/risk-calculator';
import { ValidatedEnvironmentalData } from '../src/types/environmental';

describe('Risk Calculator Engine', () => {
  test('categorizeAQI properly maps AQI ranges to EPA/CPCB categories', () => {
    assert.equal(categorizeAQI(25), 'Good');
    assert.equal(categorizeAQI(50), 'Good');
    assert.equal(categorizeAQI(51), 'Moderate');
    assert.equal(categorizeAQI(100), 'Moderate');
    assert.equal(categorizeAQI(101), 'Unhealthy for Sensitive Groups');
    assert.equal(categorizeAQI(150), 'Unhealthy for Sensitive Groups');
    assert.equal(categorizeAQI(151), 'Unhealthy');
    assert.equal(categorizeAQI(200), 'Unhealthy');
    assert.equal(categorizeAQI(201), 'Very Unhealthy');
    assert.equal(categorizeAQI(300), 'Very Unhealthy');
    assert.equal(categorizeAQI(301), 'Hazardous');
    assert.equal(categorizeAQI(450), 'Hazardous');
  });

  test('identifyDominantPollutant identifies pollutant with highest WHO exceedance ratio', () => {
    const currentMock = {
      pm25: 60, // 60 / 15 = 4.0x
      pm10: 90, // 90 / 45 = 2.0x
      no2: 25,  // 25 / 25 = 1.0x
      so2: 10,
      ozone: 40,
      co: 500,
      usAqi: 153,
      europeanAqi: 65,
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
    };

    const dominant = identifyDominantPollutant(currentMock);
    assert.equal(dominant.dominant, 'PM2.5');
    assert.equal(dominant.value, 60);
  });

  test('evaluateSensitiveGroupImpacts generates distinct actions for 4 cohorts', () => {
    const impacts = evaluateSensitiveGroupImpacts(165, 55, 45, 30);
    assert.equal(impacts.length, 4);

    const groups = impacts.map((i) => i.group);
    assert.ok(groups.includes('Children & Schools'));
    assert.ok(groups.includes('Asthmatics & Respiratory'));
    assert.ok(groups.includes('Elderly & Cardiovascular'));
    assert.ok(groups.includes('Outdoor & Municipal Workers'));

    // In Unhealthy tier (AQI 165), risk level should be High
    const childImpact = impacts.find((i) => i.group === 'Children & Schools');
    assert.equal(childImpact?.riskLevel, 'High');
    assert.ok(childImpact?.immediateAction.includes('Relocate sports indoors'));
  });

  test('calculateEnvironmentalRisk calculates complete assessment', () => {
    const mockData: ValidatedEnvironmentalData = {
      location: {
        name: 'Shivajinagar, Pune',
        latitude: 18.5314,
        longitude: 73.8446,
      },
      retrievedAt: new Date().toISOString(),
      dataTimestamp: new Date().toISOString(),
      dataSource: {
        provider: 'Open-Meteo',
        model: 'CAMS Ensemble',
        classification: 'Modelled Forecast',
        disclaimer: 'Modelled data disclaimer',
      },
      current: {
        pm25: 45,
        pm10: 90,
        no2: 30,
        so2: 12,
        ozone: 50,
        co: 600,
        usAqi: 124,
        europeanAqi: 55,
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
        { timestamp: '2026-10-23T14:00', pm25: 50, pm10: 95, usAqi: 135, europeanAqi: 60, ozone: 55, no2: 32 },
        { timestamp: '2026-10-23T15:00', pm25: 65, pm10: 110, usAqi: 156, europeanAqi: 70, ozone: 60, no2: 35 },
        { timestamp: '2026-10-23T16:00', pm25: 40, pm10: 80, usAqi: 112, europeanAqi: 48, ozone: 45, no2: 28 },
      ],
    };

    const assessment = calculateEnvironmentalRisk(mockData);
    assert.equal(assessment.overallRiskLevel, 'Unhealthy for Sensitive Groups');
    assert.equal(assessment.usAqi, 124);
    assert.equal(assessment.whoExceedanceFactor.pm25, 3.0); // 45 / 15 = 3.0
    assert.equal(assessment.peakForecastHours[0].expectedAqi, 156);
  });
});
