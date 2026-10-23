import { GoogleGenAI, Type } from '@google/genai';
import { 
  GeminiAdvisoryRecommendation, 
  RiskAssessment, 
  ValidatedEnvironmentalData 
} from '../../types/environmental';

/**
 * Builds a deterministic rules-based advisory when Gemini API key is unavailable or during API outage.
 * Transparently labeled to maintain 100% data integrity and never fabricate outputs.
 */
export function buildDeterministicAdvisory(
  data: ValidatedEnvironmentalData,
  risk: RiskAssessment
): GeminiAdvisoryRecommendation {
  const current = data.current;
  const locationName = data.location.name;
  const dominant = risk.dominantPollutant;
  const dominantVal = risk.dominantPollutantValue;
  const pm25Ratio = risk.whoExceedanceFactor.pm25;

  let summary = `Environmental intelligence for ${locationName}: Overall air quality index is ${risk.usAqi} (${risk.overallRiskLevel}). ` +
    `The dominant atmospheric contaminant is ${dominant} at ${dominantVal} ${risk.dominantPollutantUnit}, which is ${pm25Ratio}x the WHO 24-hour guideline. ` +
    `Modelled atmospheric forecasts indicate elevated particulate concentrations that warrant targeted precautionary adjustments across vulnerable cohorts.`;

  const schoolsAndChildren: string[] = [];
  const respiratoryAndElderly: string[] = [];
  const outdoorWorkers: string[] = [];
  const civicAuthorities: string[] = [];
  const municipalMitigations: string[] = [];

  if (risk.overallRiskLevel === 'Good' || risk.overallRiskLevel === 'Moderate') {
    schoolsAndChildren.push('Outdoor recess, physical education, and sports can proceed as standard.');
    schoolsAndChildren.push('Maintain classroom cross-ventilation during afternoon hours.');
    
    respiratoryAndElderly.push('Unrestricted outdoor activities. Maintain regular medical regimens.');
    respiratoryAndElderly.push('Ventilate living spaces during daytime when atmospheric dispersion is peak.');

    outdoorWorkers.push('Standard shift procedures with regular hydration breaks.');
    civicAuthorities.push('Maintain routine municipal street sweeping and green buffer maintenance.');
    municipalMitigations.push('Routine surveillance of industrial corridors (PCMC / Bhosari / Hadapsar).');
  } else if (risk.overallRiskLevel === 'Unhealthy for Sensitive Groups') {
    schoolsAndChildren.push('Shift intense athletic training and aerobic sports indoors for students with respiratory history.');
    schoolsAndChildren.push('Keep school bus boarding zones away from idling vehicle exhaust queues.');

    respiratoryAndElderly.push('Reduce prolonged or heavy outdoor exertion near arterial roads (e.g. Pune-Bangalore highway, Old Pune-Mumbai road).');
    respiratoryAndElderly.push('Ensure rescue inhalers and prescribed allergy medication are on hand.');

    outdoorWorkers.push('Equip traffic police and sanitation staff with dust filtration masks during peak commute hours.');
    civicAuthorities.push('Deploy mechanised mist sprayers along high-traffic junctions in Hinjawadi, Katraj, and Shivajinagar.');
    municipalMitigations.push('Issue public air quality alerts via municipal boards across Pune and Pimpri-Chinchwad.');
  } else {
    // Unhealthy, Very Unhealthy, Hazardous
    schoolsAndChildren.push('Suspend all outdoor morning sports, assemblies, and recess until particulate dispersion improves.');
    schoolsAndChildren.push('Seal classroom windows facing heavy traffic; run air filtration where available.');

    respiratoryAndElderly.push('Avoid all non-essential outdoor travel. Keep windows closed during early morning inversion layers.');
    respiratoryAndElderly.push('Wear N95/FFP2 respirators if transit through high-traffic corridors is unavoidable.');

    outdoorWorkers.push('Mandate N95 respirator usage for all outdoor municipal, sanitation, and construction crews.');
    outdoorWorkers.push('Rotate shift schedules to limit continuous open-air exposure to less than 2-hour blocks.');

    civicAuthorities.push('Enforce immediate dampening of unpaved road shoulders and halt non-enclosed construction dust activities.');
    civicAuthorities.push('Regulate heavy commercial vehicle transit along internal city rings during morning peak hours.');
    municipalMitigations.push('Activate high-output anti-smog guns and mechanical road sweepers across Bhosari MIDC, Hadapsar, and Pimpri.');
    municipalMitigations.push('Coordinate with PMPML to increase metro/electric bus frequencies to dampen private vehicle emission surges.');
  }

  const evidenceGroundedCitations = [
    `Location: ${locationName} (${data.location.latitude.toFixed(4)}°N, ${data.location.longitude.toFixed(4)}°E)`,
    `Current US AQI: ${risk.usAqi} (${risk.overallRiskLevel})`,
    `PM2.5: ${current.pm25} µg/m³ (WHO guideline: 15 µg/m³, ${pm25Ratio}x exceedance)`,
    `PM10: ${current.pm10} µg/m³ (WHO guideline: 45 µg/m³, ${risk.whoExceedanceFactor.pm10}x exceedance)`,
    `Dominant Pollutant: ${dominant} (${dominantVal} ${risk.dominantPollutantUnit})`,
    `Atmospheric Provider: ${data.dataSource.provider} (${data.dataSource.model})`,
    `Forecast Timestamp: ${data.dataTimestamp}`,
  ];

  return {
    summary,
    sourceAttribution: 'EcoPulse Deterministic Safety Protocol (Grounded in CPCB/WHO Thresholds)',
    isAIGenerated: false,
    modelIdentifier: 'EcoPulse Deterministic Rules Engine (Offline Fallback)',
    cohortActions: {
      schoolsAndChildren,
      respiratoryAndElderly,
      outdoorWorkers,
      civicAuthorities,
    },
    municipalMitigations,
    evidenceGroundedCitations,
  };
}

/**
 * Generates tailored environmental recommendations using Google Gemini (gemini-3.8-flash)
 * with structured JSON schema enforcement, or falls back deterministically.
 */
export async function generateGeminiRecommendations(
  data: ValidatedEnvironmentalData,
  risk: RiskAssessment
): Promise<GeminiAdvisoryRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    return buildDeterministicAdvisory(data, risk);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are EcoPulse AI, an expert environmental health officer and urban atmospheric intelligence specialist for Pune and Pimpri-Chinchwad (Maharashtra, India).

Analyze the following validated real atmospheric data and deterministic risk indicators:

LOCATION:
- Name: ${data.location.name}
- Coordinates: ${data.location.latitude}°N, ${data.location.longitude}°E
- Region: Pune & Pimpri-Chinchwad Metropolitan Area

CURRENT POLLUTANT READINGS:
- US AQI: ${risk.usAqi} (${risk.overallRiskLevel})
- European AQI: ${risk.europeanAqi}
- PM2.5: ${data.current.pm25} ${data.current.units.pm25} (${risk.whoExceedanceFactor.pm25}x WHO 24h Guideline)
- PM10: ${data.current.pm10} ${data.current.units.pm10} (${risk.whoExceedanceFactor.pm10}x WHO 24h Guideline)
- NO2: ${data.current.no2} ${data.current.units.no2}
- SO2: ${data.current.so2} ${data.current.units.so2}
- Ozone (O3): ${data.current.ozone} ${data.current.units.ozone}
- Carbon Monoxide: ${data.current.co} ${data.current.units.co}
- Dominant Pollutant: ${risk.dominantPollutant} (${risk.dominantPollutantValue} ${risk.dominantPollutantUnit})
- Model Source: ${data.dataSource.provider} (${data.dataSource.model})
- Classification: ${data.dataSource.classification}

INSTRUCTIONS:
1. Synthesize an evidence-grounded summary tailored to Pune/PCMC geography (e.g. IT corridors in Hinjawadi, industrial MIDC zones in Bhosari/Pimpri, traffic junctions in Shivajinagar/Hadapsar, thermal inversion layers).
2. Ground all claims strictly in the numbers above. Do not hallucinate or invent non-existent readings.
3. Provide concrete actionable guidance for:
   - Schools and Children
   - Respiratory Patients and Elderly
   - Outdoor and Municipal Workers
   - Civic and Municipal Authorities (PMC and PCMC municipal corporations)
4. List specific municipal dust and traffic mitigation measures.
5. Provide explicit evidence citations quoting the exact numeric readings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Executive environmental intelligence synthesis grounded in current data',
            },
            sourceAttribution: {
              type: Type.STRING,
              description: 'Attribution to Open-Meteo CAMS atmospheric model and Gemini 3.8 Flash',
            },
            cohortActions: {
              type: Type.OBJECT,
              properties: {
                schoolsAndChildren: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Actionable directives for schools, teachers, and children',
                },
                respiratoryAndElderly: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Specific medical and protective advisories for respiratory patients and seniors',
                },
                outdoorWorkers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Protective measures for traffic police, construction staff, and delivery riders',
                },
                civicAuthorities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Actionable policy directives for PMC and PCMC civic administrations',
                },
              },
              required: ['schoolsAndChildren', 'respiratoryAndElderly', 'outdoorWorkers', 'civicAuthorities'],
            },
            municipalMitigations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Concrete dust suppression, traffic diversion, and industrial control actions',
            },
            evidenceGroundedCitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Strict quotes of retrieved readings and baseline comparison metrics',
            },
          },
          required: [
            'summary',
            'sourceAttribution',
            'cohortActions',
            'municipalMitigations',
            'evidenceGroundedCitations',
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error('Empty response received from Gemini model');
    }

    const parsed = JSON.parse(response.text);

    return {
      summary: parsed.summary,
      sourceAttribution: parsed.sourceAttribution || 'Open-Meteo Atmospheric Models & Google Gemini 3.8 Flash',
      isAIGenerated: true,
      modelIdentifier: 'Google Gemini 3.8 Flash',
      cohortActions: {
        schoolsAndChildren: parsed.cohortActions?.schoolsAndChildren || [],
        respiratoryAndElderly: parsed.cohortActions?.respiratoryAndElderly || [],
        outdoorWorkers: parsed.cohortActions?.outdoorWorkers || [],
        civicAuthorities: parsed.cohortActions?.civicAuthorities || [],
      },
      municipalMitigations: parsed.municipalMitigations || [],
      evidenceGroundedCitations: parsed.evidenceGroundedCitations || [],
    };
  } catch (error) {
    console.warn('Gemini recommendation generation failed, falling back to deterministic protocol:', error);
    const fallback = buildDeterministicAdvisory(data, risk);
    fallback.sourceAttribution = 'Deterministic Fallback (Gemini API Temporarily Unavailable)';
    return fallback;
  }
}
