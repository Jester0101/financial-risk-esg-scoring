"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AssessmentForm } from "@/components/assess/AssessmentForm";
import { ResultsView } from "@/components/assess/ResultsView";
import { AssessmentResponse, RiskResult, getAssessment } from "@/lib/api";

function AssessPageContent() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams?.get("assessmentId");
  
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId);
    }
  }, [assessmentId]);

  const loadAssessment = async (id: string) => {
    try {
      setLoadingAssessment(true);
      setError(null);
      const assessment = await getAssessment(id);
      
      const docStats = assessment.metadata?.documentStats;
      const assessmentResponse: AssessmentResponse = {
        result: assessment.result,
        documentStats: docStats ? {
          filename: docStats.filename || "",
          file_size_mb: docStats.fileSizeMb || 0,
          num_pages: docStats.numPages,
          text_words: docStats.textWords,
        } : undefined,
        documentSections: assessment.metadata?.documentSections,
        financialExtraction: assessment.metadata?.financialExtraction ? {
          extracted: assessment.metadata.financialExtraction.extracted || false,
          confidence: assessment.metadata.financialExtraction.confidence || 0,
          extractionDetails: assessment.metadata.financialExtraction.extractionDetails,
        } : undefined,
      };
      
      setResult(assessmentResponse);
    } catch (err: any) {
      setError(err.message || "Failed to load assessment");
      setResult(null);
    } finally {
      setLoadingAssessment(false);
    }
  };

  const handleSubmit = async (response: AssessmentResponse) => {
    setResult(response);
    setError(null);
  };

  const handleError = (err: string) => {
    setError(err);
    setResult(null);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  if (loadingAssessment) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-foreground/70">Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {assessmentId ? "Assessment Details" : "New Risk Assessment"}
          </h1>
          <p className="text-foreground/70">
            {assessmentId 
              ? "View detailed risk assessment results."
              : "Enter company financial data and ESG information to calculate comprehensive risk score."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-apple text-danger">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {assessmentId && result ? (
          <div>
            <ResultsView result={result} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <AssessmentForm
                onSubmit={handleSubmit}
                onError={handleError}
                onLoading={handleLoading}
              />
            </div>
            
            {result && (
              <div className="lg:sticky lg:top-6 lg:h-fit">
                <ResultsView result={result} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </div>
    }>
      <AssessPageContent />
    </Suspense>
  );
}




