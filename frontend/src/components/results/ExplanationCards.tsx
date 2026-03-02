"use client";

import { RiskResult } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { TrendingUp, FileText, Link2 } from "lucide-react";

interface ExplanationCardsProps {
  result: RiskResult;
  zScoreExtractionMessage?: string;
}

export function ExplanationCards({ result, zScoreExtractionMessage }: ExplanationCardsProps) {
  const zScore = result.zScore ?? 0;
  const contributions = [
    { name: "X1: Working Capital", value: 0.15, weight: 1.2 },
    { name: "X2: Retained Earnings", value: 0.20, weight: 1.4 },
    { name: "X3: EBIT", value: 0.10, weight: 3.3 },
    { name: "X4: Market Value", value: 1.50, weight: 0.6 },
    { name: "X5: Sales", value: 1.20, weight: 1.0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold">Financial Analysis</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Z-Score</span>
              <span className="text-2xl font-bold">
                {zScoreExtractionMessage ? "—" : (typeof zScore === "number" ? zScore.toFixed(2) : "—")}
              </span>
            </div>
            {zScoreExtractionMessage && (
              <p className="text-sm text-warning mt-2">{zScoreExtractionMessage}</p>
            )}
          </div>

          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-sm text-foreground/60 mb-1">Risk Zone</p>
            <p className="text-lg font-semibold">{result.riskZone}</p>
          </div>
        </div>
      </Card>

      {result.esgScore && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold">ESG Analysis</h3>
          </div>

          <div className="space-y-4">
            {result.esgExplanation && (
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-foreground/60 mb-2">Breakdown</p>
                <p className="text-base font-medium">{result.esgExplanation}</p>
              </div>
            )}

            {result.esgTopTerms && (
              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                <p className="text-sm text-foreground/60 mb-2">Key Terms</p>
                <p className="text-sm text-foreground/80">{result.esgTopTerms}</p>
              </div>
            )}

            {result.esgRiskFlags && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-sm font-medium text-danger mb-1">⚠ Risk Flags</p>
                <p className="text-sm text-danger/80">{result.esgRiskFlags}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}



