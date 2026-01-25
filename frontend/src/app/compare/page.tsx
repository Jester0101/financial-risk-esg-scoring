"use client";

import { useState } from "react";
import { Assessment, compareAssessments } from "@/lib/api";
import { AssessmentSelector } from "@/components/compare/AssessmentSelector";
import { ComparisonView } from "@/components/compare/ComparisonView";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<Assessment[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else if (prev.length < 5) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;

    try {
      setLoading(true);
      const data = await compareAssessments(selectedIds);
      setComparisonData(data);
    } catch (error: any) {
      alert(error.message || "Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
    setComparisonData(null);
  };

  if (comparisonData && comparisonData.length > 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Selection
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">Compare Assessments</h1>
            <p className="text-foreground/70">
              Side-by-side comparison of {comparisonData.length} risk assessments.
            </p>
          </div>

          <ComparisonView assessments={comparisonData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Compare Assessments</h1>
          <p className="text-foreground/70">
            Select 2-5 assessments to compare risk metrics side-by-side.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/70">Loading comparison data...</p>
          </div>
        ) : (
          <AssessmentSelector
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onCompare={handleCompare}
          />
        )}
      </div>
    </div>
  );
}
