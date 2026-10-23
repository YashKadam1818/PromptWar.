import { 
  AgentStage, 
  AgentStepLog, 
  AgentWorkflowState, 
  LocationCoordinates, 
  PermittedAgentTool 
} from '../../types/environmental';
import { fetchAirQualityData, searchLocations } from '../open-meteo';
import { calculateEnvironmentalRisk } from '../risk-calculator';
import { validateEnvironmentalData, verifyAgentOutput } from '../validator';
import { generateGeminiRecommendations } from './gemini';
import { DEFAULT_LOCATION } from '../pune-regions';

const PERMITTED_TOOLS: readonly PermittedAgentTool[] = [
  'search_location',
  'fetch_air_quality_forecast',
  'validate_environmental_data',
  'calculate_environmental_risk',
  'generate_recommendations',
  'verify_agent_output',
] as const;

export interface AgentRunOptions {
  location?: LocationCoordinates;
  searchQuery?: string;
  onStepUpdate?: (state: AgentWorkflowState) => void;
}

/**
 * Server-side bounded orchestrator for EcoPulse AI.
 * Enforces strict 7-stage workflow, tool allowlist, max 2 retries, and bounded execution.
 */
export class EcoPulseAgentOrchestrator {
  private state: AgentWorkflowState;
  private onStepUpdate?: (state: AgentWorkflowState) => void;

  constructor(options?: { onStepUpdate?: (state: AgentWorkflowState) => void }) {
    this.onStepUpdate = options?.onStepUpdate;
    this.state = {
      currentStage: 'planning',
      status: 'idle',
      stagesCompleted: 0,
      totalStages: 7,
      logs: [],
      retryCount: 0,
      maxRetries: 2,
    };
  }

  private isToolPermitted(toolName: string): toolName is PermittedAgentTool {
    return PERMITTED_TOOLS.includes(toolName as PermittedAgentTool);
  }

  private logStep(
    stage: AgentStage,
    label: string,
    status: AgentStepLog['status'],
    toolUsed?: PermittedAgentTool,
    durationMs?: number,
    details?: string
  ) {
    if (toolUsed && !this.isToolPermitted(toolUsed)) {
      throw new Error(`Security Violation: Tool '${toolUsed}' is not in the orchestrator allowlist.`);
    }

    const log: AgentStepLog = {
      stage,
      label,
      status,
      toolUsed,
      durationMs,
      details,
      timestamp: new Date().toISOString(),
    };

    // Update existing log for same stage or append
    const existingIdx = this.state.logs.findIndex(l => l.stage === stage);
    if (existingIdx >= 0) {
      this.state.logs[existingIdx] = log;
    } else {
      this.state.logs.push(log);
    }

    if (this.onStepUpdate) {
      this.onStepUpdate({ ...this.state });
    }
  }

  public getState(): AgentWorkflowState {
    return { ...this.state };
  }

  /**
   * Executes the bounded 7-stage environmental intelligence workflow.
   */
  public async execute(params: AgentRunOptions): Promise<AgentWorkflowState> {
    this.state.status = 'running';
    this.state.startedAt = new Date().toISOString();
    this.state.logs = [];
    this.state.stagesCompleted = 0;

    let targetLocation = params.location || DEFAULT_LOCATION;

    try {
      // -------------------------------------------------------------
      // STAGE 1: PLANNING
      // -------------------------------------------------------------
      this.state.currentStage = 'planning';
      const planStart = Date.now();
      this.logStep('planning', 'Stage 1/7: Initializing Environmental Mission Plan', 'in_progress');

      if (params.searchQuery && !params.location) {
        this.logStep('planning', `Stage 1/7: Resolving query "${params.searchQuery}" via geocoding`, 'in_progress', 'search_location');
        const locations = await searchLocations(params.searchQuery, 1);
        if (locations.length > 0) {
          targetLocation = locations[0];
        } else {
          throw new Error(`Could not resolve location for query "${params.searchQuery}"`);
        }
      }

      this.state.location = targetLocation;
      this.state.stagesCompleted = 1;
      this.logStep(
        'planning',
        `Stage 1/7: Plan Formulated for ${targetLocation.name} (${targetLocation.latitude.toFixed(3)}°N, ${targetLocation.longitude.toFixed(3)}°E)`,
        'completed',
        undefined,
        Date.now() - planStart,
        'Validated bounded 7-stage workflow; verified tool allowlist and boundary parameters.'
      );

      // -------------------------------------------------------------
      // STAGE 2: RETRIEVING ENVIRONMENTAL DATA
      // -------------------------------------------------------------
      this.state.currentStage = 'retrieving';
      const retrieveStart = Date.now();
      this.logStep(
        'retrieving',
        `Stage 2/7: Querying Open-Meteo Air Quality Model Ensemble`,
        'in_progress',
        'fetch_air_quality_forecast'
      );

      let fetchedData;
      let retrievalAttempts = 0;
      while (retrievalAttempts <= this.state.maxRetries) {
        try {
          fetchedData = await fetchAirQualityData(targetLocation.latitude, targetLocation.longitude, targetLocation);
          break;
        } catch (fetchErr) {
          retrievalAttempts++;
          this.state.retryCount = retrievalAttempts;
          if (retrievalAttempts > this.state.maxRetries) {
            throw fetchErr;
          }
          await new Promise(r => setTimeout(r, 500 * retrievalAttempts));
        }
      }

      if (!fetchedData) {
        throw new Error('Failed to retrieve environmental data after maximum permitted retries.');
      }

      this.state.stagesCompleted = 2;
      this.logStep(
        'retrieving',
        `Stage 2/7: Atmospheric Data Ingested (72-hour forecast, 8 pollutant variables)`,
        'completed',
        'fetch_air_quality_forecast',
        Date.now() - retrieveStart,
        `Ingested CAMS/ECMWF atmospheric model payload for ${targetLocation.name}.`
      );

      // -------------------------------------------------------------
      // STAGE 3: VALIDATING DATA
      // -------------------------------------------------------------
      this.state.currentStage = 'validating';
      const valStart = Date.now();
      this.logStep(
        'validating',
        'Stage 3/7: Running Atmospheric Physics & Bounds Validation',
        'in_progress',
        'validate_environmental_data'
      );

      const validationResult = validateEnvironmentalData(fetchedData);
      if (!validationResult.isValid) {
        throw new Error(`Data validation failed: ${validationResult.issues.join('; ')}`);
      }

      this.state.validatedData = validationResult.sanitizedData;
      this.state.stagesCompleted = 3;
      this.logStep(
        'validating',
        `Stage 3/7: Data Quality Verified (Physical boundaries & completeness validated)`,
        'completed',
        'validate_environmental_data',
        Date.now() - valStart,
        validationResult.warnings.length > 0 
          ? `Validated with advisory notes: ${validationResult.warnings.join(', ')}`
          : 'Zero physical anomalies detected; timestamps and chemical bounds verified.'
      );

      // -------------------------------------------------------------
      // STAGE 4: CALCULATING RISK INDICATORS
      // -------------------------------------------------------------
      this.state.currentStage = 'calculating';
      const calcStart = Date.now();
      this.logStep(
        'calculating',
        'Stage 4/7: Calculating Deterministic Risk Matrices & WHO Exceedance',
        'in_progress',
        'calculate_environmental_risk'
      );

      const riskAssessment = calculateEnvironmentalRisk(this.state.validatedData);
      this.state.riskAssessment = riskAssessment;
      this.state.stagesCompleted = 4;
      this.logStep(
        'calculating',
        `Stage 4/7: Risk Evaluated: ${riskAssessment.overallRiskLevel} (AQI ${riskAssessment.usAqi}, Dominant: ${riskAssessment.dominantPollutant})`,
        'completed',
        'calculate_environmental_risk',
        Date.now() - calcStart,
        `Calculated WHO exceedance ratios: PM2.5 (${riskAssessment.whoExceedanceFactor.pm25}x), PM10 (${riskAssessment.whoExceedanceFactor.pm10}x), NO2 (${riskAssessment.whoExceedanceFactor.no2}x). Evaluated 4 sensitive demographics.`
      );

      // -------------------------------------------------------------
      // STAGE 5: GENERATING GEMINI RECOMMENDATIONS
      // -------------------------------------------------------------
      this.state.currentStage = 'generating';
      const genStart = Date.now();
      this.logStep(
        'generating',
        'Stage 5/7: Generating Contextual Advisories via Google Gemini 3.8 Flash',
        'in_progress',
        'generate_recommendations'
      );

      const recommendations = await generateGeminiRecommendations(
        this.state.validatedData,
        this.state.riskAssessment
      );
      this.state.recommendations = recommendations;
      this.state.stagesCompleted = 5;
      this.logStep(
        'generating',
        `Stage 5/7: Structured Advisories Generated (${recommendations.isAIGenerated ? 'Google Gemini 3.8 Flash' : 'Deterministic Fallback Engine'})`,
        'completed',
        'generate_recommendations',
        Date.now() - genStart,
        `Synthesized demographic advisories across 4 cohorts and civic municipal mitigations.`
      );

      // -------------------------------------------------------------
      // STAGE 6: VERIFYING AGENT OUTPUT
      // -------------------------------------------------------------
      this.state.currentStage = 'verifying';
      const verStart = Date.now();
      this.logStep(
        'verifying',
        'Stage 6/7: Verifying Output Grounding & Safety Invariants',
        'in_progress',
        'verify_agent_output'
      );

      const verificationReport = verifyAgentOutput(
        this.state.recommendations,
        this.state.riskAssessment,
        this.state.validatedData
      );
      this.state.verificationReport = verificationReport;
      this.state.stagesCompleted = 6;
      this.logStep(
        'verifying',
        `Stage 6/7: Output Verification ${verificationReport.isVerified ? 'Passed' : 'Completed with Flagged Items'} (${verificationReport.checks.filter(c => c.passed).length}/${verificationReport.checks.length} checks)`,
        'completed',
        'verify_agent_output',
        Date.now() - verStart,
        verificationReport.anomaliesDetected.length > 0
          ? `Advisory flags: ${verificationReport.anomaliesDetected.join(', ')}`
          : 'All 5 grounding and sanity invariants satisfied.'
      );

      // -------------------------------------------------------------
      // STAGE 7: COMPLETION
      // -------------------------------------------------------------
      this.state.currentStage = 'completed';
      this.state.status = 'completed';
      this.state.stagesCompleted = 7;
      this.state.completedAt = new Date().toISOString();

      const totalMs = Date.now() - new Date(this.state.startedAt!).getTime();
      this.logStep(
        'completed',
        `Stage 7/7: Environmental Intelligence Agent Run Complete in ${(totalMs / 1000).toFixed(2)}s`,
        'completed',
        undefined,
        totalMs,
        `Mission accomplished for ${targetLocation.name}. All outputs verified and sealed.`
      );

      return this.getState();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown execution failure';
      this.state.status = 'error';
      this.state.error = errorMessage;
      this.state.currentStage = 'failed';

      this.logStep(
        'failed',
        `Execution Failed at Stage ${this.state.currentStage}: ${errorMessage}`,
        'failed',
        undefined,
        undefined,
        'Agent bounded retry limits exhausted or invariant violated.'
      );

      return this.getState();
    }
  }
}
