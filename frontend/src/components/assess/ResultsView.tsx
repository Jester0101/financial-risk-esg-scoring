"use client";

import { AssessmentResponse } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { RiskSummary } from "@/components/results/RiskSummary";
import { ComparisonBlock } from "@/components/results/ComparisonBlock";
import { ExplanationCards } from "@/components/results/ExplanationCards";
import { EvidenceSection } from "@/components/results/EvidenceSection";
import { DataQuality } from "@/components/results/DataQuality";
import { NextActions } from "@/components/results/NextActions";

interface ResultsViewProps {
  result: AssessmentResponse;
}

export function ResultsView({ result }: ResultsViewProps) {
  const riskResult = result.result;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-3xl font-bold">Risk Assessment</h2>
      </div>

      <RiskSummary result={riskResult} />

      <ComparisonBlock result={riskResult} />

      <ExplanationCards result={riskResult} />

      {result.documentStats && (
        <EvidenceSection
          documentStats={result.documentStats}
          documentSections={result.documentSections}
          esgTopTerms={riskResult.esgTopTerms}
          esgRiskFlags={riskResult.esgRiskFlags}
        />
      )}

      <DataQuality
        hasFinancialData={true}
        hasEsgData={!!riskResult.esgScore}
        documentStats={result.documentStats}
        financialExtraction={result.financialExtraction}
      />

      <NextActions />
    </div>
  );
}



