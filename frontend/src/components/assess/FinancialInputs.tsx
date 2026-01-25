"use client";

import { Input } from "@/components/ui/Input";
import { Info, Calculator } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FinancialInputsProps {
  x1: string;
  setX1: (value: string) => void;
  x2: string;
  setX2: (value: string) => void;
  x3: string;
  setX3: (value: string) => void;
  x4: string;
  setX4: (value: string) => void;
  x5: string;
  setX5: (value: string) => void;
}

export function FinancialInputs({
  x1,
  setX1,
  x2,
  setX2,
  x3,
  setX3,
  x4,
  setX4,
  x5,
  setX5,
}: FinancialInputsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Financial Data</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-apple mb-4">
          <div className="flex items-start gap-3">
            <Calculator className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-sm text-foreground/80">
              <p className="font-medium mb-1">Altman Z-Score Components</p>
              <p>
                These five ratios are the core of the Altman Z-Score model, a widely-used
                predictor of financial distress.
              </p>
            </div>
          </div>
        </div>

        <Input
          label="X1: Working Capital / Total Assets (Optional)"
          value={x1}
          onChange={(e) => setX1(e.target.value)}
          type="number"
          step="any"
          helperText="Measures liquidity relative to assets. Higher is better. Leave empty to extract from document."
          placeholder="0.15 (or leave empty)"
        />

        <Input
          label="X2: Retained Earnings / Total Assets (Optional)"
          value={x2}
          onChange={(e) => setX2(e.target.value)}
          type="number"
          step="any"
          helperText="Shows accumulated profitability. Higher indicates more stable company. Leave empty to extract from document."
          placeholder="0.20 (or leave empty)"
        />

        <Input
          label="X3: EBIT / Total Assets (Optional)"
          value={x3}
          onChange={(e) => setX3(e.target.value)}
          type="number"
          step="any"
          helperText="Operating profitability. Measures how efficiently assets generate profit. Leave empty to extract from document."
          placeholder="0.10 (or leave empty)"
        />

        <Input
          label="X4: Market Value of Equity / Total Liabilities (Optional)"
          value={x4}
          onChange={(e) => setX4(e.target.value)}
          type="number"
          step="any"
          helperText="Market confidence indicator. If empty, system will use Book Value of Equity from Balance Sheet (may differ from Market Value)."
          placeholder="1.50 (or leave empty)"
        />

        <Input
          label="X5: Sales / Total Assets (Optional)"
          value={x5}
          onChange={(e) => setX5(e.target.value)}
          type="number"
          step="any"
          helperText="Asset turnover ratio. Shows how well assets generate revenue. Leave empty to extract from document."
          placeholder="1.20 (or leave empty)"
        />

        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-apple">
            <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs text-foreground/70 space-y-2">
              <p>
                <strong>Optional fields:</strong> Leave any field empty to automatically extract it from the Annual Report PDF when you upload it.
              </p>
              <p>
                <strong>Additional ratios (Current Ratio, Debt-to-Equity, ROE):</strong> These will be automatically 
                extracted from the Annual Report PDF when you upload it. They are used to refine the financial 
                risk assessment but are not required for the core Altman Z-Score calculation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



