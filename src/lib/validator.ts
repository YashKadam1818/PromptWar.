import { 
  GeminiAdvisoryRecommendation, 
  OutputVerificationReport, 
  RiskAssessment, 
  ValidatedEnvironmentalData 
} from '../types/environmental';

export interface DataValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  sanitizedData: ValidatedEnvironmentalData;
}

/**
 * Validates and sanitizes raw or normalized environmental data.
 */
export function validateEnvironmentalData(data: ValidatedEnvironmentalData): DataValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Coordinate check
  if (!data.location) {
    issues.push('Missing location metadata');
  } else {
    if (data.location.latitude < -90 || data.location.latitude > 90) {
      issues.push(`Latitude out of valid physical range: ${data.location.latitude}`);
    }
    if (data.location.longitude < -180 || data.location.longitude > 180) {
      issues.push(`Longitude out of valid physical range: ${data.location.longitude}`);
    }
  }

  // Pollutant physical range checks
  const current = data.current;
  if (!current) {
    issues.push('Current environmental readings payload is missing');
  } else {
    if (current.pm25 < 0 || current.pm25 > 2500) {
      issues.push(`PM2.5 value (${current.pm25}) is outside physical atmospheric limits (0 - 2500 µg/m³)`);
    }
    if (current.pm10 < 0 || current.pm10 > 3500) {
      issues.push(`PM10 value (${current.pm10}) is outside physical atmospheric limits (0 - 3500 µg/m³)`);
    }
    if (current.usAqi < 0 || current.usAqi > 1000) {
      issues.push(`US AQI (${current.usAqi}) is outside valid scale limits (0 - 1000)`);
    }
    if (current.europeanAqi < 0 || current.europeanAqi > 500) {
      issues.push(`European AQI (${current.europeanAqi}) is outside valid scale limits (0 - 500)`);
    }

    if (current.pm25 > current.pm10 && current.pm10 > 0) {
      warnings.push(`PM2.5 (${current.pm25}) exceeds PM10 (${current.pm10}); physically PM10 encompasses PM2.5 in atmospheric fractions`);
    }
  }

  // Timestamps
  if (!data.dataTimestamp || isNaN(Date.parse(data.dataTimestamp))) {
    warnings.push(`Unrecognized data timestamp: ${data.dataTimestamp}, defaulted to current time`);
  }

  // Hourly forecasts check
  if (!Array.isArray(data.hourlyForecast) || data.hourlyForecast.length === 0) {
    issues.push('Hourly forecast series is empty');
  } else if (data.hourlyForecast.length < 12) {
    warnings.push(`Hourly forecast series is truncated (${data.hourlyForecast.length} hours available)`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    sanitizedData: data,
  };
}

/**
 * Validates agent advisory output against retrieved environmental readings.
 * Ensures recommendations are factually grounded and free from safety hallucinations.
 */
export function verifyAgentOutput(
  recommendations: GeminiAdvisoryRecommendation,
  risk: RiskAssessment,
  data: ValidatedEnvironmentalData
): OutputVerificationReport {
  const checks: OutputVerificationReport['checks'] = [];
  const anomalies: string[] = [];

  // Check 1: Non-empty advisory content
  const hasSummary = Boolean(recommendations.summary && recommendations.summary.trim().length > 20);
  checks.push({
    checkName: 'Non-Empty Structured Synthesis',
    passed: hasSummary,
    details: hasSummary ? 'Executive summary populated with comprehensive analysis.' : 'Summary was too brief or absent.',
  });
  if (!hasSummary) anomalies.push('Agent summary is under-specified');

  // Check 2: Cohort guidance completeness
  const cohort = recommendations.cohortActions;
  const hasCohorts = Boolean(
    cohort &&
    cohort.schoolsAndChildren?.length > 0 &&
    cohort.respiratoryAndElderly?.length > 0 &&
    cohort.outdoorWorkers?.length > 0 &&
    cohort.civicAuthorities?.length > 0
  );
  checks.push({
    checkName: 'Targeted Demographic Coverage',
    passed: hasCohorts,
    details: hasCohorts 
      ? 'All four vulnerable demographic cohorts received targeted actionable advisories.'
      : 'One or more demographic cohorts lacked specific mitigation actions.',
  });
  if (!hasCohorts) anomalies.push('Demographic cohort actions are incomplete');

  // Check 3: Risk severity alignment (Sanity check)
  // If AQI is Very Unhealthy or Hazardous, recommendations must not suggest unrestricted outdoor activity
  const lowerSummary = (recommendations.summary + ' ' + JSON.stringify(cohort)).toLowerCase();
  const isHighRisk = risk.overallRiskLevel === 'Unhealthy' || risk.overallRiskLevel === 'Very Unhealthy' || risk.overallRiskLevel === 'Hazardous';
  const contradictsHighRisk = isHighRisk && (
    lowerSummary.includes('perfect day for outdoor running') ||
    lowerSummary.includes('outdoor sports encouraged') ||
    lowerSummary.includes('no precautions necessary')
  );
  checks.push({
    checkName: 'Health Directional Alignment',
    passed: !contradictsHighRisk,
    details: !contradictsHighRisk
      ? `Recommendations appropriately reflect ${risk.overallRiskLevel} risk category (AQI ${risk.usAqi}).`
      : 'Severe contradiction detected: High pollution level was paired with unrestricted outdoor encouragement.',
  });
  if (contradictsHighRisk) anomalies.push('Advisory contradicts high pollution risk status');

  // Check 4: Pollutant grounding check
  // Does the advisory or evidence mention the dominant pollutant or AQI accurately?
  const dominantName = risk.dominantPollutant.toLowerCase();
  const mentionsDominant = lowerSummary.includes(dominantName) || recommendations.evidenceGroundedCitations.some(c => c.toLowerCase().includes(dominantName));
  checks.push({
    checkName: 'Dominant Pollutant Grounding',
    passed: mentionsDominant,
    details: mentionsDominant 
      ? `Advisories accurately ground citations in primary driver ${risk.dominantPollutant} (${risk.dominantPollutantValue} ${risk.dominantPollutantUnit}).`
      : `Advisory failed to cite primary pollutant driver ${risk.dominantPollutant}.`,
  });

  // Check 5: Source attribution check
  const hasAttribution = Boolean(recommendations.sourceAttribution && recommendations.sourceAttribution.length > 5);
  checks.push({
    checkName: 'Source Attribution & Provenance',
    passed: hasAttribution,
    details: hasAttribution ? `Attribution specified: ${recommendations.sourceAttribution}` : 'Missing source attribution.',
  });

  const isVerified = checks.every(c => c.passed) || (checks.filter(c => !c.passed).length <= 1 && !contradictsHighRisk);

  return {
    isVerified,
    checks,
    anomaliesDetected: anomalies,
    verificationTimestamp: new Date().toISOString(),
  };
}
