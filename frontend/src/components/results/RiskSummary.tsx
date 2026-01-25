"use client";

import { RiskResult } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface RiskSummaryProps {
  result: RiskResult;
}

/**
 * Get risk grade based on Z-zone first, then probability.
 * Grade must NOT contradict Z-zone.
 * Z < 1.81 (Distress) → Never show green/low risk signals.
 */
function getRiskGrade(probability: number, zScore: number, riskZone: string): {
  grade: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
} {
  if (riskZone.includes("Distress")) {
    if (probability < 0.30) {
      return {
        grade: "D",
        color: "text-danger",
        bgColor: "bg-danger/10",
        icon: <AlertCircle className="w-6 h-6" />,
        label: "High Risk (Distress Zone)",
      };
    }
    return {
      grade: "E",
      color: "text-danger",
      bgColor: "bg-danger/10",
      icon: <AlertCircle className="w-6 h-6" />,
      label: "Very High Risk (Distress Zone)",
    };
  }
  
  if (riskZone.includes("Grey")) {
    if (probability < 0.20) {
      return {
        grade: "C",
        color: "text-warning",
        bgColor: "bg-warning/10",
        icon: <AlertTriangle className="w-6 h-6" />,
        label: "Moderate Risk (Grey Zone)",
      };
    }
    return {
      grade: "D",
      color: "text-danger",
      bgColor: "bg-danger/10",
      icon: <AlertCircle className="w-6 h-6" />,
      label: "High Risk (Grey Zone)",
    };
  }
  
  if (probability < 0.05) {
    return {
      grade: "A",
      color: "text-success",
      bgColor: "bg-success/10",
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: "Very Low Risk",
    };
  }
  if (probability < 0.15) {
    return {
      grade: "B",
      color: "text-success",
      bgColor: "bg-success/10",
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: "Low Risk",
    };
  }
  if (probability < 0.30) {
    return {
      grade: "C",
      color: "text-warning",
      bgColor: "bg-warning/10",
      icon: <AlertTriangle className="w-6 h-6" />,
      label: "Moderate Risk",
    };
  }
  return {
    grade: "D",
    color: "text-danger",
    bgColor: "bg-danger/10",
    icon: <AlertCircle className="w-6 h-6" />,
    label: "High Risk",
  };
}

export function RiskSummary({ result }: RiskSummaryProps) {
  const probability = result.pEnhanced || result.compositeScore;
  const zScore = result.zScore ?? 0;
  const riskZone = result.riskZone || "Unknown";
  
  const riskInfo = getRiskGrade(probability, zScore, riskZone);

  const zoneColor = riskZone.includes("Distress")
    ? "text-danger"
    : riskZone.includes("Grey")
    ? "text-warning"
    : "text-success";

  return (
    <Card className="p-8" variant="elevated">
      {/* Primary KPI: Probability of Default */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <p className="text-sm text-foreground/60 mb-2">Probability of Default</p>
          <p className="text-5xl font-bold text-foreground mb-2">
            {(probability * 100).toFixed(1)}%
          </p>
          <p className="text-base font-medium text-foreground/80">{riskInfo.label}</p>
        </div>
        <div
          className={`w-20 h-20 ${riskInfo.bgColor} ${riskInfo.color} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          {riskInfo.icon}
        </div>
      </div>

      {/* Risk Grade */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full">
          <span className="text-2xl font-bold text-foreground">Grade {riskInfo.grade}</span>
          <span className="text-sm text-foreground/60">{riskZone}</span>
        </div>
      </div>

      {/* Risk Scale */}
      <div className="pt-6 border-t border-border">
        <div className="flex items-center justify-between text-xs text-foreground/60 mb-3">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-success via-warning to-danger transition-all duration-500"
            style={{ width: "100%" }}
          />
          <div
            className="absolute top-0 h-full w-1.5 bg-foreground shadow-lg transition-all duration-500"
            style={{ left: `${probability * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
}



