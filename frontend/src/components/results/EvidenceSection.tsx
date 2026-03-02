"use client";

import { Card } from "@/components/ui/Card";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface EvidenceSectionProps {
  documentStats?: {
    filename: string;
    file_size_mb: number;
    num_pages?: number;
    text_words?: number;
  };
  documentSections?: Record<
    string,
    {
      e: number;
      s: number;
      g: number;
      esg_total: number;
    }
  >;
  esgTopTerms?: string;
  esgRiskFlags?: string;
}

export function EvidenceSection({
  documentStats,
  documentSections,
  esgTopTerms,
  esgRiskFlags,
}: EvidenceSectionProps) {
  if (!documentStats) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-lg font-semibold">ESG Evidence & Transparency</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-apple">
          <p className="text-sm font-medium mb-2">Document Processed</p>
          <div className="space-y-1 text-sm text-foreground/70">
            <p>File: {documentStats.filename}</p>
            <p>Size: {documentStats.file_size_mb.toFixed(2)} MB</p>
            {documentStats.num_pages && <p>Pages: {documentStats.num_pages}</p>}
            {documentStats.text_words && (
              <p>Words extracted: {documentStats.text_words.toLocaleString()}</p>
            )}
          </div>
        </div>

        {documentSections && Object.keys(documentSections).length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">ESG Sections Analyzed</p>
            <div className="space-y-2">
              {Object.entries(documentSections).map(([section, scores]) => (
                <div
                  key={section}
                  className="p-3 bg-muted/30 rounded-apple border border-border"
                >
                  <p className="text-sm font-medium mb-2">{section}</p>
                  <div className="flex gap-4 text-xs text-foreground/70">
                    <span>E: {(scores.e * 100).toFixed(0)}%</span>
                    <span>S: {(scores.s * 100).toFixed(0)}%</span>
                    <span>G: {(scores.g * 100).toFixed(0)}%</span>
                    <span className="ml-auto font-medium">
                      Total: {(scores.esg_total * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {esgTopTerms && (
          <div>
            <p className="text-sm font-medium mb-2">Key ESG Terms Found</p>
            <div className="flex flex-wrap gap-2">
              {esgTopTerms.split(", ").map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}

        {esgRiskFlags && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-apple">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-danger mb-1">Risk Flags Detected</p>
                <p className="text-sm text-danger/80">{esgRiskFlags}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </Card>
  );
}



