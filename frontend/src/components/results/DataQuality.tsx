"use client";

import { Card } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface DataQualityProps {
  hasFinancialData: boolean;
  hasEsgData: boolean;
  documentStats?: {
    filename: string;
    file_size_mb: number;
    num_pages?: number;
    text_words?: number;
  };
  financialExtraction?: {
    extracted: boolean;
    confidence: number;
    extractionDetails?: Record<string, any>;
  };
}

export function DataQuality({
  hasFinancialData,
  hasEsgData,
  documentStats,
  financialExtraction,
}: DataQualityProps) {
  const financialQuality = hasFinancialData ? "complete" : "incomplete";
  const esgQuality = hasEsgData ? (documentStats ? "high" : "medium") : "low";
  const financialExtracted = financialExtraction?.extracted || false;
  const extractionConfidence = financialExtraction?.confidence || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <Info className="w-5 h-5 text-warning" />
        </div>
        <h3 className="text-lg font-semibold">Data Sources</h3>
      </div>

      <div className="space-y-3">
        {/* Financial Data */}
        <div className="p-3 bg-muted/50 rounded-apple">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {hasFinancialData ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
              <div>
                <p className="text-sm font-medium">Financial Data</p>
                <p className="text-xs text-foreground/60">
                  {financialExtracted
                    ? `Auto-extracted from document (${(extractionConfidence * 100).toFixed(0)}% confidence)`
                    : financialQuality === "complete"
                    ? "All required ratios provided manually"
                    : "Missing required data"}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                financialQuality === "complete"
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              {financialExtracted ? "Auto" : financialQuality === "complete" ? "Manual" : "Incomplete"}
            </span>
          </div>
          
          {/* Show extracted additional ratios if available */}
          {financialExtracted && financialExtraction && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-foreground/70 mb-2">Extended Financial Ratios Extracted:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {financialExtraction.extractionDetails?.current_ratio !== undefined && financialExtraction.extractionDetails?.current_ratio !== null && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Current Ratio:</span>
                    <span className="font-medium">{Number(financialExtraction.extractionDetails.current_ratio).toFixed(2)}</span>
                  </div>
                )}
                {financialExtraction.extractionDetails?.debt_to_equity !== undefined && financialExtraction.extractionDetails?.debt_to_equity !== null && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Debt-to-Equity:</span>
                    <span className="font-medium">{Number(financialExtraction.extractionDetails.debt_to_equity).toFixed(2)}</span>
                  </div>
                )}
                {financialExtraction.extractionDetails?.return_on_equity !== undefined && financialExtraction.extractionDetails?.return_on_equity !== null && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">ROE:</span>
                    <span className="font-medium">{(Number(financialExtraction.extractionDetails.return_on_equity) * 100).toFixed(1)}%</span>
                  </div>
                )}
                {financialExtraction.extractionDetails?.quick_ratio !== undefined && financialExtraction.extractionDetails?.quick_ratio !== null && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Quick Ratio:</span>
                    <span className="font-medium">{Number(financialExtraction.extractionDetails.quick_ratio).toFixed(2)}</span>
                  </div>
                )}
                {financialExtraction.extractionDetails?.ebitda_margin !== undefined && financialExtraction.extractionDetails?.ebitda_margin !== null && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">EBITDA Margin:</span>
                    <span className="font-medium">{(Number(financialExtraction.extractionDetails.ebitda_margin) * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              {financialExtraction.extractionDetails?.fiscal_year && (
                <p className="text-xs text-foreground/50 mt-2">
                  Fiscal Year: {financialExtraction.extractionDetails.fiscal_year}
                </p>
              )}
              {(!financialExtraction.extractionDetails?.current_ratio && 
                !financialExtraction.extractionDetails?.debt_to_equity && 
                !financialExtraction.extractionDetails?.return_on_equity &&
                !financialExtraction.extractionDetails?.quick_ratio &&
                !financialExtraction.extractionDetails?.ebitda_margin) && (
                <p className="text-xs text-foreground/50 mt-2">
                  No additional ratios extracted (only Altman Z-Score components found)
                </p>
              )}
            </div>
          )}
        </div>

        {/* ESG Data */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-apple">
          <div className="flex items-center gap-3">
            {esgQuality === "high" ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : esgQuality === "medium" ? (
              <AlertCircle className="w-5 h-5 text-warning" />
            ) : (
              <AlertCircle className="w-5 h-5 text-foreground/30" />
            )}
            <div>
              <p className="text-sm font-medium">ESG Data</p>
              <p className="text-xs text-foreground/60">
                {esgQuality === "high"
                  ? "Document analyzed with high confidence"
                  : esgQuality === "medium"
                  ? "Text provided, moderate confidence"
                  : "No ESG data provided"}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              esgQuality === "high"
                ? "bg-success/10 text-success"
                : esgQuality === "medium"
                ? "bg-warning/10 text-warning"
                : "bg-muted text-foreground/40"
            }`}
          >
            {esgQuality === "high" ? "High" : esgQuality === "medium" ? "Medium" : "Low"}
          </span>
        </div>

      </div>
    </Card>
  );
}



