"use client";

import { Assessment, getAllAssessments } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface AssessmentSelectorProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCompare: () => void;
}

export function AssessmentSelector({ selectedIds, onToggle, onCompare }: AssessmentSelectorProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await getAllAssessments(50); // Get last 50 assessments
      setAssessments(data);
    } catch (error) {
      console.error("Failed to load assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-foreground/70">Loading assessments...</p>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-foreground/70 mb-4">No assessments found.</p>
          <Button onClick={() => (window.location.href = "/assess")}>
            Create Assessment
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Assessments to Compare</h2>
        <p className="text-sm text-foreground/70">
          Select 2-5 assessments to compare side-by-side. {selectedIds.length} selected.
        </p>
      </div>

      <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
        {assessments.map((assessment) => {
          const isSelected = selectedIds.includes(assessment.id || "");
          const pd = assessment.result.pEnhanced || assessment.result.compositeScore || 0;

          return (
            <div
              key={assessment.id}
              onClick={() => assessment.id && onToggle(assessment.id)}
              className={`p-4 border rounded-apple cursor-pointer transition-all ${
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-foreground/60" />
                    <span className="font-medium">
                      {assessment.companyName || "Unknown Company"}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-accent" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-foreground/60 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {assessment.createdAt
                        ? format(new Date(assessment.createdAt), "MMM d, yyyy")
                        : "Unknown date"}
                    </div>
                    <span>PD: {(pd * 100).toFixed(1)}%</span>
                    <span>Z: {assessment.result.zScore.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onCompare}
        disabled={selectedIds.length < 2 || selectedIds.length > 5}
        className="w-full"
      >
        Compare {selectedIds.length} Assessment{selectedIds.length !== 1 ? "s" : ""}
      </Button>

      {selectedIds.length > 5 && (
        <p className="text-sm text-destructive mt-2 text-center">
          Maximum 5 assessments can be compared at once.
        </p>
      )}
    </Card>
  );
}

