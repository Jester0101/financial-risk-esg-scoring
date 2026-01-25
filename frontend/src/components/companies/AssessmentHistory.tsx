"use client";

import { Assessment } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, TrendingUp, TrendingDown, X } from "lucide-react";
import { format } from "date-fns";

interface AssessmentHistoryProps {
  assessments: Assessment[];
  onSelect: (assessment: Assessment) => void;
  onClose: () => void;
  companyName?: string;
}

export function AssessmentHistory({ assessments, onSelect, onClose, companyName }: AssessmentHistoryProps) {
  if (assessments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {companyName ? `${companyName} - Assessment History` : "Assessment History"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-center py-8 text-foreground/70">
          No assessments found for this company.
        </div>
      </Card>
    );
  }

  const getRiskColor = (pd: number) => {
    if (pd < 0.2) return "text-green-600";
    if (pd < 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLabel = (pd: number) => {
    if (pd < 0.2) return "Low Risk";
    if (pd < 0.4) return "Moderate Risk";
    return "High Risk";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {companyName ? `${companyName} - Assessment History` : "Assessment History"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => {
          const pd = assessment.result.pEnhanced || assessment.result.compositeScore || 0;
          return (
            <Card key={assessment.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-foreground/60" />
                    <span className="text-sm text-foreground/60">
                      {assessment.createdAt
                        ? format(new Date(assessment.createdAt), "MMM d, yyyy 'at' h:mm a")
                        : "Unknown date"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Z-Score</p>
                      <p className="font-semibold">{assessment.result.zScore.toFixed(2)}</p>
                      <p className="text-xs text-foreground/60">{assessment.result.riskZone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">ESG Score</p>
                      <p className="font-semibold">{(assessment.result.esgScore * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">Default Probability</p>
                      <p className={`font-semibold ${getRiskColor(pd)}`}>
                        {(pd * 100).toFixed(1)}%
                      </p>
                      <p className={`text-xs ${getRiskColor(pd)}`}>{getRiskLabel(pd)}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelect(assessment)}
                  className="ml-4"
                >
                  View Details
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

