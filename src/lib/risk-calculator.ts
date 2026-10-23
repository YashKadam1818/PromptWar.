import { RiskAssessment, RiskLevel, SensitiveGroupImpact, ValidatedEnvironmentalData } from '../types/environmental';

// WHO 24-hour ambient air quality guidelines (2021) in µg/m³
const WHO_GUIDELINES = {
  pm25: 15,
  pm10: 45,
  no2: 25,
  so2: 40,
  ozone: 100,
  co: 4000,
};

/**
 * Categorizes US AQI index into official risk category.
 */
export function categorizeAQI(aqi: number): RiskLevel {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Calculates dominant pollutant based on normalized exceedance over WHO health thresholds.
 */
export function identifyDominantPollutant(current: ValidatedEnvironmentalData['current']): {
  dominant: 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'O3' | 'CO';
  value: number;
  unit: string;
} {
  const ratios = [
    { pollutant: 'PM2.5' as const, ratio: current.pm25 / WHO_GUIDELINES.pm25, value: current.pm25, unit: current.units.pm25 },
    { pollutant: 'PM10' as const, ratio: current.pm10 / WHO_GUIDELINES.pm10, value: current.pm10, unit: current.units.pm10 },
    { pollutant: 'NO2' as const, ratio: current.no2 / WHO_GUIDELINES.no2, value: current.no2, unit: current.units.no2 },
    { pollutant: 'SO2' as const, ratio: current.so2 / WHO_GUIDELINES.so2, value: current.so2, unit: current.units.so2 },
    { pollutant: 'O3' as const, ratio: current.ozone / WHO_GUIDELINES.ozone, value: current.ozone, unit: current.units.ozone },
    { pollutant: 'CO' as const, ratio: current.co / WHO_GUIDELINES.co, value: current.co, unit: current.units.co },
  ];

  ratios.sort((a, b) => b.ratio - a.ratio);
  const top = ratios[0];
  return {
    dominant: top.pollutant,
    value: top.value,
    unit: top.unit,
  };
}

/**
 * Determines cohort-specific risk profiles deterministically from current pollutants and AQI.
 */
export function evaluateSensitiveGroupImpacts(
  aqi: number,
  pm25: number,
  no2: number,
  ozone: number
): SensitiveGroupImpact[] {
  // Children & Schools
  let childRisk: SensitiveGroupImpact['riskLevel'] = 'Low';
  let childConcern = 'Air quality supports normal outdoor school sports and play.';
  let childAction = 'No restrictions necessary.';

  if (aqi > 200 || pm25 > 75) {
    childRisk = 'Severe';
    childConcern = 'Dangerous particulate concentrations. High risk of acute respiratory distress and reduced lung capacity.';
    childAction = 'Cancel all outdoor recess, sports, and assemblies. Keep school ventilation on filtered recirculation.';
  } else if (aqi > 150 || pm25 > 50) {
    childRisk = 'High';
    childConcern = 'Elevated PM2.5 exacerbates childhood wheezing and triggers school absenteeism.';
    childAction = 'Relocate sports indoors; restrict strenuous outdoor physical education for primary grades.';
  } else if (aqi > 100 || pm25 > 35) {
    childRisk = 'Moderate';
    childConcern = 'Sensitive children with diagnosed asthma may cough or exhibit early wheezing during physical activity.';
    childAction = 'Provide indoor rest options for children with inhalers or known allergies.';
  }

  // Asthmatics & Respiratory
  let asthmaRisk: SensitiveGroupImpact['riskLevel'] = 'Low';
  let asthmaConcern = 'Minimal respiratory irritation expected.';
  let asthmaAction = 'Follow routine maintenance medication schedule.';

  if (aqi > 200 || pm25 > 75 || no2 > 60) {
    asthmaRisk = 'Severe';
    asthmaConcern = 'Severe chemical irritation from fine particulates and nitrogen oxides triggering bronchial spasm.';
    asthmaAction = 'Stay strictly indoors in air-purified rooms. Have rescue bronchodilators immediately accessible.';
  } else if (aqi > 150 || pm25 > 50 || no2 > 40) {
    asthmaRisk = 'High';
    asthmaConcern = 'Substantial trigger for asthma attacks, persistent coughing, and airway inflammation.';
    asthmaAction = 'Avoid outdoor exertion. Wear an N95 respirator if stepping outside along busy transit corridors.';
  } else if (aqi > 100 || pm25 > 35) {
    asthmaRisk = 'Moderate';
    asthmaConcern = 'Noticeable throat dryness or mild chest tightness, especially near traffic congestion.';
    asthmaAction = 'Limit brisk walking along arterial roads during rush hours.';
  }

  // Elderly & Cardiovascular
  let elderlyRisk: SensitiveGroupImpact['riskLevel'] = 'Low';
  let elderlyConcern = 'Baseline cardiac strain is low under current environmental conditions.';
  let elderlyAction = 'Standard outdoor walks are safe.';

  if (aqi > 200 || pm25 > 75) {
    elderlyRisk = 'Severe';
    elderlyConcern = 'Microscopic PM2.5 crosses into blood circulation, provoking acute cardiovascular events and hypertensive spikes.';
    elderlyAction = 'Cease all outdoor morning walks. Consult physician if experiencing palpitations or unusual fatigue.';
  } else if (aqi > 150 || pm25 > 50) {
    elderlyRisk = 'High';
    elderlyConcern = 'Increased vascular inflammation and elevated risk for individuals with hypertension or coronary history.';
    elderlyAction = 'Shift morning walk hours away from early morning temperature inversions to late afternoon indoors.';
  } else if (aqi > 100 || pm25 > 35) {
    elderlyRisk = 'Moderate';
    elderlyConcern = 'Prolonged exposure may cause shortness of breath or elevated pulse.';
    elderlyAction = 'Pace daily errands and rest frequently in well-ventilated indoor spaces.';
  }

  // Outdoor & Municipal Workers
  let workerRisk: SensitiveGroupImpact['riskLevel'] = 'Low';
  let workerConcern = 'Permissible environmental conditions for full manual shift duration.';
  let workerAction = 'Stay hydrated; maintain routine dust safety standards.';

  if (aqi > 200 || pm25 > 75) {
    workerRisk = 'Severe';
    workerConcern = 'Extreme 8-hour cumulative toxic particulate dosage for traffic police, construction, and sanitation staff.';
    workerAction = 'Mandate N95 respirators. Implement 15-minute shaded/filtered rest rotations every hour.';
  } else if (aqi > 150 || pm25 > 50) {
    workerRisk = 'High';
    workerConcern = 'Significant occupational exposure leading to occupational bronchitis and chronic fatigue.';
    workerAction = 'Issue protective masks to on-duty personnel. Prohibit open dry sweeping; require water spraying.';
  } else if (aqi > 100 || pm25 > 35) {
    workerRisk = 'Moderate';
    workerConcern = 'Elevated dust load along highway road works and traffic choke points.';
    workerAction = 'Provide dust masks; schedule heavy manual loading during midday hours with better atmospheric mixing.';
  }

  return [
    {
      group: 'Children & Schools',
      riskLevel: childRisk,
      concern: childConcern,
      immediateAction: childAction,
    },
    {
      group: 'Asthmatics & Respiratory',
      riskLevel: asthmaRisk,
      concern: asthmaConcern,
      immediateAction: asthmaAction,
    },
    {
      group: 'Elderly & Cardiovascular',
      riskLevel: elderlyRisk,
      concern: elderlyConcern,
      immediateAction: elderlyAction,
    },
    {
      group: 'Outdoor & Municipal Workers',
      riskLevel: workerRisk,
      concern: workerConcern,
      immediateAction: workerAction,
    },
  ];
}

/**
 * Deterministically evaluates environmental dataset and produces a standardized RiskAssessment.
 */
export function calculateEnvironmentalRisk(data: ValidatedEnvironmentalData): RiskAssessment {
  const current = data.current;
  const overallRisk = categorizeAQI(current.usAqi);
  const dominant = identifyDominantPollutant(current);

  const pm25Exceedance = Number((current.pm25 / WHO_GUIDELINES.pm25).toFixed(1));
  const pm10Exceedance = Number((current.pm10 / WHO_GUIDELINES.pm10).toFixed(1));
  const no2Exceedance = Number((current.no2 / WHO_GUIDELINES.no2).toFixed(1));

  const sensitiveGroupImpacts = evaluateSensitiveGroupImpacts(
    current.usAqi,
    current.pm25,
    current.no2,
    current.ozone
  );

  // Scan next 24 hourly periods to pinpoint peak exposure windows
  const next24Hours = (data.hourlyForecast || []).slice(0, 24);
  const sortedByAqi = [...next24Hours].sort((a, b) => b.usAqi - a.usAqi);
  const peakForecastHours = sortedByAqi.slice(0, 3).map((item) => ({
    time: item.timestamp,
    expectedAqi: Math.round(item.usAqi),
    expectedPm25: Math.round(item.pm25),
  }));

  return {
    overallRiskLevel: overallRisk,
    usAqi: Math.round(current.usAqi),
    europeanAqi: Math.round(current.europeanAqi),
    dominantPollutant: dominant.dominant,
    dominantPollutantValue: Math.round(dominant.value * 10) / 10,
    dominantPollutantUnit: dominant.unit,
    whoExceedanceFactor: {
      pm25: pm25Exceedance,
      pm10: pm10Exceedance,
      no2: no2Exceedance,
    },
    sensitiveGroupImpacts,
    peakForecastHours,
    calculatedAt: new Date().toISOString(),
  };
}
