"use client";

import { Assessment } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface ComparisonViewProps {
  assessments: Assessment[];
}

export function ComparisonView({ assessments }: ComparisonViewProps) {
  const getRiskColor = (pd: number) => {
    if (pd < 0.2) return "text-green-600";
    if (pd < 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLabel = (pd: number) => {
    if (pd < 0.2) return "Low";
    if (pd < 0.4) return "Moderate";
    return "High";
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const pds = assessments.map(a => a.result.pEnhanced || a.result.compositeScore || 0);
  const avgPd = pds.reduce((a, b) => a + b, 0) / pds.length;
  const minPd = Math.min(...pds);
  const maxPd = Math.max(...pds);

  const zScores = assessments.map(a => a.result.zScore);
  const avgZ = zScores.reduce((a, b) => a + b, 0) / zScores.length;

  const esgScores = assessments.map(a => a.result.esgScore);
  const avgEsg = esgScores.reduce((a, b) => a + b, 0) / esgScores.length;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Comparison Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-foreground/60 mb-1">Average Default Probability</p>
            <p className="text-2xl font-bold">{formatPercent(avgPd)}</p>
            <p className="text-xs text-foreground/60">
              Range: {formatPercent(minPd)} - {formatPercent(maxPd)}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground/60 mb-1">Average Z-Score</p>
            <p className="text-2xl font-bold">{avgZ.toFixed(2)}</p>
            <p className="text-xs text-foreground/60">
              Range: {Math.min(...zScores).toFixed(2)} - {Math.max(...zScores).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground/60 mb-1">Average ESG Score</p>
            <p className="text-2xl font-bold">{formatPercent(avgEsg)}</p>
            <p className="text-xs text-foreground/60">
              Range: {formatPercent(Math.min(...esgScores))} - {formatPercent(Math.max(...esgScores))}
            </p>
          </div>
        </div>
      </Card>

      {/* Detailed Comparison Table */}
      <Card className="p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Detailed Comparison</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Company</th>
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-right py-3 px-4 font-semibold">Z-Score</th>
              <th className="text-right py-3 px-4 font-semibold">Risk Zone</th>
              <th className="text-right py-3 px-4 font-semibold">ESG Score</th>
              <th className="text-right py-3 px-4 font-semibold">PD Baseline</th>
              <th className="text-right py-3 px-4 font-semibold">PD Adjusted</th>
              <th className="text-right py-3 px-4 font-semibold">PD Enhanced</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment, index) => {
              const pd = assessment.result.pEnhanced || assessment.result.compositeScore || 0;
              const prevPd = index > 0 
                ? (assessments[index - 1].result.pEnhanced || assessments[index - 1].result.compositeScore || 0)
                : null;

              return (
                <tr key={assessment.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium">
                    {assessment.companyName || "Unknown"}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground/70">
                    {assessment.createdAt
                      ? format(new Date(assessment.createdAt), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {assessment.result.zScore.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm">{assessment.result.riskZone}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatPercent(assessment.result.esgScore)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {assessment.result.pBaseline ? formatPercent(assessment.result.pBaseline) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {assessment.result.pAdjusted ? formatPercent(assessment.result.pAdjusted) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-mono font-semibold ${getRiskColor(pd)}`}>
                        {formatPercent(pd)}
                      </span>
                      {prevPd !== null && (
                        <span className="text-xs">
                          {pd > prevPd ? (
                            <TrendingUp className="w-4 h-4 text-red-600" />
                          ) : pd < prevPd ? (
                            <TrendingDown className="w-4 h-4 text-green-600" />
                          ) : (
                            <Minus className="w-4 h-4 text-foreground/40" />
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Key Metrics Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Financial Metrics</h3>
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium">{assessment.companyName || "Unknown"}</span>
                <div className="text-right">
                  <p className="font-mono">Z: {assessment.result.zScore.toFixed(2)}</p>
                  <p className="text-xs text-foreground/60">{assessment.result.riskZone}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">ESG Performance</h3>
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium">{assessment.companyName || "Unknown"}</span>
                <div className="text-right">
                  <p className="font-mono font-semibold">
                    {formatPercent(assessment.result.esgScore)}
                  </p>
                  {assessment.result.esgExplanation && (
                    <p className="text-xs text-foreground/60">
                      {assessment.result.esgExplanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

