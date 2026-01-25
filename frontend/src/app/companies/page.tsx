"use client";

import { useState, useEffect } from "react";
import { Company, Assessment, getAllCompanies, createCompany, updateCompany, deleteCompany, getCompanyAssessments } from "@/lib/api";
import { CompanyList } from "@/components/companies/CompanyList";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { AssessmentHistory } from "@/components/companies/AssessmentHistory";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
      alert("Failed to load companies. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCompany(undefined);
    setShowForm(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleSave = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'assessmentIds'>) => {
    try {
      if (editingCompany?.id) {
        await updateCompany(editingCompany.id, companyData);
      } else {
        await createCompany(companyData);
      }
      setShowForm(false);
      setEditingCompany(undefined);
      loadCompanies();
    } catch (error: any) {
      alert(error.message || "Failed to save company");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company? All associated assessments will also be deleted.")) {
      return;
    }
    try {
      await deleteCompany(id);
      loadCompanies();
    } catch (error: any) {
      alert(error.message || "Failed to delete company");
    }
  };

  const handleViewAssessments = async (companyId: string) => {
    try {
      const company = companies.find(c => c.id === companyId);
      setSelectedCompanyName(company?.name || "");
      setSelectedCompanyId(companyId);
      const data = await getCompanyAssessments(companyId);
      setAssessments(data);
      setShowHistory(true);
    } catch (error: any) {
      alert(error.message || "Failed to load assessments");
    }
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    if (assessment.id) {
      window.location.href = `/assess?assessmentId=${assessment.id}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-foreground/70">Loading companies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Company Profiles</h1>
            <p className="text-foreground/70">
              Manage company profiles and view assessment history.
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Company
          </Button>
        </div>

        {showForm && (
          <div className="mb-8">
            <CompanyForm
              company={editingCompany}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingCompany(undefined);
              }}
            />
          </div>
        )}

        {showHistory && selectedCompanyId && (
          <div className="mb-8">
            <AssessmentHistory
              assessments={assessments}
              companyName={selectedCompanyName}
              onSelect={handleSelectAssessment}
              onClose={() => {
                setShowHistory(false);
                setSelectedCompanyId(null);
                setAssessments([]);
              }}
            />
          </div>
        )}

        {!showForm && !showHistory && (
          <CompanyList
            companies={companies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewAssessments={handleViewAssessments}
          />
        )}
      </div>
    </div>
  );
}
