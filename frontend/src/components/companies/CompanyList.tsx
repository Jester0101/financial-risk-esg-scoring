"use client";

import { Company } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Building2, Calendar, FileText, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onViewAssessments: (companyId: string) => void;
}

export function CompanyList({ companies, onEdit, onDelete, onViewAssessments }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
        <p className="text-foreground/70">No companies found. Create your first company profile.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-accent" />
              <div>
                <h3 className="font-semibold text-lg">{company.name}</h3>
                {company.industry && (
                  <p className="text-sm text-foreground/60">{company.industry}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(company)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => company.id && onDelete(company.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {company.description && (
            <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{company.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-foreground/60 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{company.assessmentIds?.length || 0} assessments</span>
            </div>
            {company.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(company.createdAt), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => company.id && onViewAssessments(company.id)}
          >
            View Assessments
          </Button>
        </Card>
      ))}
    </div>
  );
}

