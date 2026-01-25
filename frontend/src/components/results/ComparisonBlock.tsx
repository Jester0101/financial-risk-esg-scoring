"use client";

import { RiskResult } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonBlockProps {
  result: RiskResult;
}

export function ComparisonBlock({ result }: ComparisonBlockProps) {
  const baseline = result.pBaseline ?? result.compositeScore ?? 0;
  const adjusted = result.pAdjusted ?? baseline;
  const enhanced = result.pEnhanced ?? result.compositeScore ?? adjusted;
  
  const esgAdjustment = enhanced - adjusted;
  const esgAdjustmentPercent = esgAdjustment * 100;
  
  const esgScore = result.esgScore ?? 0.5;
  const isDirectionCorrect = 
    (esgScore > 0.5 && esgAdjustment < 0) || 
    (esgScore < 0.5 && esgAdjustment > 0) || 
    (esgScore === 0.5 && Math.abs(esgAdjustment) < 0.001);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Risk Calculation Breakdown</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-5 bg-muted/30 rounded-xl">
          <div>
            <p className="text-sm text-foreground/60 mb-1">Financial Risk</p>
            <p className="text-3xl font-bold text-foreground">
              {(baseline * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-sm text-foreground/60">
            Baseline
          </div>
        </div>

        {adjusted !== baseline && (
          <div className="flex items-center justify-between p-5 bg-warning/10 rounded-xl border border-warning/30">
            <div className="flex-1">
              <p className="text-sm text-foreground/60 mb-1">Extended Financial Analysis</p>
              <p className="text-3xl font-bold text-foreground">
                {(adjusted * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-sm text-right">
              <div className={adjusted > baseline ? "text-danger font-medium" : "text-success font-medium"}>
                {adjusted > baseline ? "↑ Increased" : "↓ Reduced"}
              </div>
              <div className="text-xs text-foreground/50 mt-1">
                {((adjusted - baseline) * 100).toFixed(1)}pp
              </div>
            </div>
          </div>
        )}

        {esgScore > 0 && (
          <>
            <div className="flex items-center justify-between p-5 bg-accent/10 rounded-xl border border-accent/30">
              <div>
                <p className="text-sm text-foreground/60 mb-1">ESG Score</p>
                <p className="text-3xl font-bold text-foreground">
                  {(esgScore * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-sm font-medium text-foreground/70">
                {esgScore > 0.5 ? "Strong" : esgScore < 0.5 ? "Weak" : "Neutral"}
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-primary/10 rounded-xl border border-primary/30">
              <div className="flex items-center gap-3">
                {esgScore > 0.5 ? (
                  esgAdjustment < 0 ? (
                    <TrendingDown className="w-6 h-6 text-success" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-warning" />
                  )
                ) : esgScore < 0.5 ? (
                  esgAdjustment > 0 ? (
                    <TrendingUp className="w-6 h-6 text-danger" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-warning" />
                  )
                ) : (
                  <Minus className="w-6 h-6 text-foreground/40" />
                )}
                <div>
                  <p className="text-sm text-foreground/60 mb-1">ESG Impact</p>
                  <p
                    className={`text-2xl font-bold ${
                      (esgScore > 0.5 && esgAdjustment < 0) || (esgScore < 0.5 && esgAdjustment > 0)
                        ? esgScore > 0.5 ? "text-success" : "text-danger"
                        : "text-foreground"
                    }`}
                  >
                    {esgAdjustment > 0 ? "+" : ""}
                    {esgAdjustmentPercent.toFixed(1)}pp
                  </p>
                </div>
              </div>
              <div className="text-sm text-foreground/60">
                {esgScore > 0.5
                  ? esgAdjustment < 0
                    ? "Risk reduced"
                    : "No change"
                  : esgScore < 0.5
                  ? esgAdjustment > 0
                    ? "Risk increased"
                    : "No change"
                  : "No change"}
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-between p-5 bg-success/10 rounded-xl border-2 border-success/40 shadow-sm">
          <div>
            <p className="text-sm text-foreground/60 mb-1">Final Risk Assessment</p>
            <p className="text-3xl font-bold text-foreground">
              {(enhanced * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-sm font-medium text-success">
            Complete
          </div>
        </div>
      </div>
    </Card>
  );
}



