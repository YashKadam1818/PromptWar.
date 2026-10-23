'use client';

import React from 'react';
import { AgentWorkflowState, AgentStepLog, AgentStage } from '@/types/environmental';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Cpu, 
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AgentWorkspaceProps {
  workflowState: AgentWorkflowState | null;
  isExecuting: boolean;
}

const STAGES_ORDER: Array<{ stage: AgentStage; label: string; stageNumber: number; tool: string }> = [
  { stage: 'planning', label: 'Mission Planning & Bounds Verification', stageNumber: 1, tool: 'search_location' },
  { stage: 'retrieving', label: 'Retrieving Atmospheric Data Ensemble', stageNumber: 2, tool: 'fetch_air_quality_forecast' },
  { stage: 'validating', label: 'Atmospheric Physics & Data Integrity Validation', stageNumber: 3, tool: 'validate_environmental_data' },
  { stage: 'calculating', label: 'Calculating Deterministic Risk Matrices', stageNumber: 4, tool: 'calculate_environmental_risk' },
  { stage: 'generating', label: 'Synthesizing Gemini 3.8 Contextual Advisories', stageNumber: 5, tool: 'generate_recommendations' },
  { stage: 'verifying', label: 'Verifying Grounding & Safety Invariants', stageNumber: 6, tool: 'verify_agent_output' },
  { stage: 'completed', label: 'Mission Completed & Certificate Sealed', stageNumber: 7, tool: 'none' },
];

export function AgentWorkspace({ workflowState, isExecuting }: AgentWorkspaceProps) {
  const [showLogs, setShowLogs] = React.useState(true);

  if (!workflowState && !isExecuting) {
    return (
      <section aria-labelledby="agent-workspace-title" className="bg-white rounded-xl border border-[#E8DFD8] p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DFD8] flex items-center justify-center text-[#C85A32]">
            <Cpu className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 id="agent-workspace-title" className="font-editorial text-xl font-bold text-[#1F2421]">
              Bounded AI Agent Workspace
            </h2>
            <p className="text-xs text-[#595E5B]">
              Autonomous 7-Stage Verifier Engine • Tool Allowlist Enforced
            </p>
          </div>
        </div>
        <div className="bg-[#FAF7F2] border border-dashed border-[#E8DFD8] rounded-lg p-6 text-center">
          <Sparkles className="w-6 h-6 text-[#C85A32] mx-auto mb-2 opacity-60" aria-hidden="true" />
          <p className="text-sm font-medium text-[#1F2421]">Agent is Idle and Ready</p>
          <p className="text-xs text-[#595E5B] max-w-md mx-auto mt-1">
            Click &ldquo;Run AI Analysis&rdquo; to execute the multi-step bounded agent workflow for the selected Pune / PCMC observation zone.
          </p>
        </div>
      </section>
    );
  }

  const logs = workflowState?.logs || [];
  const currentStage = workflowState?.currentStage || 'planning';
  const stagesCompleted = workflowState?.stagesCompleted || 0;
  const progressPercent = Math.min(100, Math.round((stagesCompleted / 7) * 100));

  return (
    <section aria-labelledby="agent-workspace-title" className="bg-white rounded-xl border border-[#E8DFD8] p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header and Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD8] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="agent-workspace-title" className="font-editorial text-2xl font-bold text-[#1F2421]">
              Bounded AI Agent Orchestrator
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              workflowState?.status === 'completed'
                ? 'bg-[#EBF1ED] text-[#2D503C] border-[#8FA89B]'
                : (workflowState?.status === 'error'
                  ? 'bg-[#FBE8E8] text-[#8A1818] border-[#D47979]'
                  : 'bg-[#FFF8E7] text-[#8A5A00] border-[#E6C687] animate-pulse')
            }`}>
              {workflowState?.status === 'completed' 
                ? 'Stage 7/7 Completed' 
                : (workflowState?.status === 'error' ? 'Stage Failed' : `Executing Stage ${stagesCompleted + 1}/7`)}
            </span>
          </div>
          <p className="text-xs text-[#595E5B] mt-1">
            Strict 7-stage workflow bound • Zero shell access • Allowlist: 6 permitted tools • Grounded verification
          </p>
        </div>

        {/* Retries and Verifier Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-[#595E5B] block">Transient Retries</span>
            <span className="font-mono font-bold text-[#1F2421]">{workflowState?.retryCount || 0} / 2</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#E8DFD8] flex items-center justify-center text-[#C85A32]">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-[#595E5B] mb-1.5 font-medium">
          <span>Workflow Execution Progress: {stagesCompleted} of 7 Stages</span>
          <span className="font-mono font-bold text-[#C85A32]">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-[#FAF7F2] border border-[#E8DFD8] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#C85A32] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 7 Workflow Stages Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {STAGES_ORDER.map(({ stage, label, stageNumber, tool }) => {
          const log = logs.find((l) => l.stage === stage);
          const isDone = log?.status === 'completed';
          const isFailed = log?.status === 'failed';
          const isCurrent = currentStage === stage && !isDone && !isFailed;

          let cardBg = 'bg-[#FAF7F2] border-[#E8DFD8] text-[#595E5B]';
          if (isDone) {
            cardBg = 'bg-[#EBF1ED] border-[#8FA89B] text-[#2D503C]';
          } else if (isCurrent) {
            cardBg = 'bg-[#FFF8E7] border-[#E6C687] text-[#8A5A00] ring-1 ring-[#C85A32]';
          } else if (isFailed) {
            cardBg = 'bg-[#FBE8E8] border-[#D47979] text-[#8A1818]';
          }

          return (
            <div 
              key={stage}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-[10px] opacity-75">
                    Step {stageNumber}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6B8E7B]" aria-hidden="true" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#C85A32] animate-spin" aria-hidden="true" />
                  ) : isFailed ? (
                    <AlertCircle className="w-3.5 h-3.5 text-[#BC4749]" aria-hidden="true" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#D8CFC8]" />
                  )}
                </div>
                <p className="font-semibold text-[11px] leading-tight line-clamp-2">
                  {label.split(' ')[0]} {label.split(' ')[1]}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[10px] font-mono">
                <span className="truncate" title={tool}>{tool !== 'none' ? tool.slice(0, 10) + '..' : 'Orch'}</span>
                {log?.durationMs ? <span>{log.durationMs}ms</span> : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Execution Log Console */}
      <div className="border border-[#E8DFD8] rounded-xl overflow-hidden bg-[#FAF7F2]">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F4EFEA] border-b border-[#E8DFD8] text-xs font-semibold text-[#1F2421] hover:bg-[#E8DFD8]/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#C85A32]" aria-hidden="true" />
            <span>Agent Orchestration Audit Logs ({logs.length} entries)</span>
          </div>
          {showLogs ? (
            <ChevronDown className="w-4 h-4 text-[#595E5B]" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#595E5B]" aria-hidden="true" />
          )}
        </button>

        {showLogs && (
          <div className="p-4 max-h-64 overflow-y-auto space-y-2.5 font-mono text-xs custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-[#595E5B] italic">Awaiting execution launch...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-[#595E5B] flex-shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold flex-shrink-0 ${
                    log.status === 'completed'
                      ? 'bg-[#EBF1ED] text-[#2D503C]'
                      : (log.status === 'in_progress'
                        ? 'bg-[#FFF8E7] text-[#8A5A00]'
                        : 'bg-[#FBE8E8] text-[#8A1818]')
                  }`}>
                    {log.stage.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-[#1F2421]">{log.label}</span>
                    {log.toolUsed && (
                      <span className="ml-1.5 text-[10px] text-[#C85A32] bg-white border border-[#E8DFD8] px-1 rounded">
                        tool: {log.toolUsed}
                      </span>
                    )}
                    {log.details && (
                      <p className="text-[#595E5B] text-[10px] mt-0.5">{log.details}</p>
                    )}
                  </div>
                  {log.durationMs !== undefined && (
                    <span className="text-[#595E5B] text-[10px] flex-shrink-0">
                      {log.durationMs}ms
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Verification Certificate */}
      {workflowState?.verificationReport && (
        <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6B8E7B]" aria-hidden="true" />
              <h3 className="font-editorial text-base font-bold text-[#1F2421]">
                Stage 6 Verification Certificate
              </h3>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
              workflowState.verificationReport.isVerified
                ? 'bg-[#EBF1ED] text-[#2D503C]'
                : 'bg-[#FFF8E7] text-[#8A5A00]'
            }`}>
              {workflowState.verificationReport.isVerified ? 'Certified Grounded' : 'Qualified'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {workflowState.verificationReport.checks.map((check, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-[#E8DFD8] flex items-start gap-2">
                {check.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6B8E7B] flex-shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#C85A32] flex-shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <span className="font-semibold text-[#1F2421] block">{check.checkName}</span>
                  <span className="text-[11px] text-[#595E5B]">{check.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
