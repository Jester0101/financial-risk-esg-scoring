"use client";

import { Company } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { useState } from "react";

interface CompanyFormProps {
  company?: Company;
  onSave: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'assessmentIds'>) => void;
  onCancel: () => void;
}

export function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const [name, setName] = useState(company?.name || "");
  const [industry, setIndustry] = useState(company?.industry || "");
  const [description, setDescription] = useState(company?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Company name is required");
      return;
    }
    onSave({ name: name.trim(), industry: industry.trim() || undefined, description: description.trim() || undefined });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{company ? "Edit Company" : "Create Company"}</h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter company name"
        />

        <Input
          label="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="e.g., Technology, Finance, Manufacturing"
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional company description"
          rows={4}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {company ? "Update Company" : "Create Company"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

