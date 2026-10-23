/**
 * EcoPulse AI - Core Data Models and Domain Types
 * Strict typing for Open-Meteo APIs, Risk Calculations, and Bounded Agent Stages.
 */

export interface LocationCoordinates {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  admin1?: string; // State / Division (e.g., Maharashtra)
  admin2?: string; // District (e.g., Pune)
  country?: string;
  isPreset?: boolean;
}

export interface RawAirQualityResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: {
    time: string;
    interval: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
    european_aqi?: number;
    us_aqi?: number;
  };
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    pm10?: (number | null)[];
    pm2_5?: (number | null)[];
    carbon_monoxide?: (number | null)[];
    nitrogen_dioxide?: (number | null)[];
    sulphur_dioxide?: (number | null)[];
    ozone?: (number | null)[];
    european_aqi?: (number | null)[];
    us_aqi?: (number | null)[];
  };
}

export interface ValidatedEnvironmentalData {
  location: LocationCoordinates;
  retrievedAt: string;
  dataTimestamp: string;
  dataSource: {
    provider: string;
    model: string;
    classification: 'Modelled Forecast' | 'Sensor Observation';
    disclaimer: string;
  };
  current: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    so2: number;
    ozone: number;
    usAqi: number;
    europeanAqi: number;
    units: {
      pm25: string;
      pm10: string;
      co: string;
      no2: string;
      so2: string;
      ozone: string;
      usAqi: string;
      europeanAqi: string;
    };
  };
  hourlyForecast: Array<{
    timestamp: string;
    pm25: number;
    pm10: number;
    usAqi: number;
    europeanAqi: number;
    ozone: number;
    no2: number;
  }>;
}

export type RiskLevel = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface SensitiveGroupImpact {
  group: 'Children & Schools' | 'Asthmatics & Respiratory' | 'Elderly & Cardiovascular' | 'Outdoor & Municipal Workers';
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  concern: string;
  immediateAction: string;
}

export interface RiskAssessment {
  overallRiskLevel: RiskLevel;
  usAqi: number;
  europeanAqi: number;
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'O3' | 'CO';
  dominantPollutantValue: number;
  dominantPollutantUnit: string;
  whoExceedanceFactor: {
    pm25: number; // Factor above WHO 24h guideline (15 µg/m³)
    pm10: number; // Factor above WHO 24h guideline (45 µg/m³)
    no2: number;  // Factor above WHO 24h guideline (25 µg/m³)
  };
  sensitiveGroupImpacts: SensitiveGroupImpact[];
  peakForecastHours: Array<{
    time: string;
    expectedAqi: number;
    expectedPm25: number;
  }>;
  calculatedAt: string;
}

export interface GeminiAdvisoryRecommendation {
  summary: string;
  sourceAttribution: string;
  isAIGenerated: boolean;
  modelIdentifier: string;
  cohortActions: {
    schoolsAndChildren: string[];
    respiratoryAndElderly: string[];
    outdoorWorkers: string[];
    civicAuthorities: string[];
  };
  municipalMitigations: string[];
  evidenceGroundedCitations: string[];
}

export interface OutputVerificationReport {
  isVerified: boolean;
  checks: Array<{
    checkName: string;
    passed: boolean;
    details: string;
  }>;
  anomaliesDetected: string[];
  verificationTimestamp: string;
}

export type AgentStage = 
  | 'planning'
  | 'retrieving'
  | 'validating'
  | 'calculating'
  | 'generating'
  | 'verifying'
  | 'completed'
  | 'failed';

export interface AgentStepLog {
  stage: AgentStage;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  toolUsed?: string;
  durationMs?: number;
  details?: string;
  timestamp: string;
}

export interface AgentWorkflowState {
  currentStage: AgentStage;
  status: 'idle' | 'running' | 'completed' | 'error';
  stagesCompleted: number;
  totalStages: number;
  logs: AgentStepLog[];
  retryCount: number;
  maxRetries: number;
  location?: LocationCoordinates;
  validatedData?: ValidatedEnvironmentalData;
  riskAssessment?: RiskAssessment;
  recommendations?: GeminiAdvisoryRecommendation;
  verificationReport?: OutputVerificationReport;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export type PermittedAgentTool = 
  | 'search_location'
  | 'fetch_air_quality_forecast'
  | 'validate_environmental_data'
  | 'calculate_environmental_risk'
  | 'generate_recommendations'
  | 'verify_agent_output';
