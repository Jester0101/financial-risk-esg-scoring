"use client";

import { Input } from "@/components/ui/Input";
import { Info } from "lucide-react";

interface CompanyInfoProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  fiscalYear: string;
  setFiscalYear: (value: string) => void;
}

export function CompanyInfo({
  companyName,
  setCompanyName,
  country,
  setCountry,
  industry,
  setIndustry,
  fiscalYear,
  setFiscalYear,
}: CompanyInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Company Information</h3>
        <p className="text-sm text-foreground/70 mb-6">
          Basic company details help contextualize the risk assessment. This information is used
          for reference and does not affect the risk calculation.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Apple Inc."
          helperText="Official company name"
        />

        <Input
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g., United States"
          helperText="Country of incorporation or primary operations"
        />

        <Input
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g., Technology, Financial Services"
          helperText="Primary industry sector"
        />

        <Input
          label="Fiscal Year"
          value={fiscalYear}
          onChange={(e) => setFiscalYear(e.target.value)}
          placeholder="2024"
          type="number"
          helperText="Fiscal year for the financial data"
        />
      </div>

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-apple">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm text-foreground/80">
            <p className="font-medium mb-1">Why we ask for this</p>
            <p>
              Company context helps interpret risk scores. Different industries and regions have
              varying risk profiles, which can help you understand whether a score is typical or
              concerning for that sector.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



