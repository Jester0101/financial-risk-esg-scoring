"use client";

import { useState, useRef } from "react";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  useOpenai: boolean;
  onUseOpenaiChange: (value: boolean) => void;
  useExtractedFinancial?: boolean;
  onUseExtractedFinancialChange?: (value: boolean) => void;
}

export function FileUpload({
  file,
  onFileChange,
  useOpenai,
  onUseOpenaiChange,
  useExtractedFinancial = false,
  onUseExtractedFinancialChange,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    const allowedExtensions = [".pdf", ".docx", ".doc", ".txt"];

    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      alert("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100MB");
      return;
    }

    onFileChange(selectedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-apple p-8 text-center transition-all ${
          dragActive
            ? "border-accent bg-accent/5"
            : file
            ? "border-success bg-success/5"
            : "border-border hover:border-foreground/30"
        }`}
      >
        {file ? (
          <div className="space-y-3">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-foreground/60 mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFileChange(null)}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-foreground/30 mx-auto" />
            <div>
              <p className="font-medium text-foreground mb-1">
                Drop your ESG report here
              </p>
              <p className="text-sm text-foreground/60">
                or click to browse (PDF, DOCX, TXT)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleChange}
        className="hidden"
      />

      {file && (
        <Card className="p-4 bg-success/5 border border-success/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Document ready for analysis
              </p>
              <p className="text-xs text-foreground/70">
                The system will automatically extract ESG information and financial data from this document 
                using GPT-4o. Both ESG scoring and financial ratio extraction will be performed.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-accent/5 border border-accent/20">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useOpenai}
            onChange={(e) => onUseOpenaiChange(e.target.checked)}
            className="w-4 h-4 rounded border-border mt-0.5"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Enable GPT-4o Analysis
            </p>
            <p className="text-xs text-foreground/70 mt-1">
              Uses advanced AI for more accurate ESG scoring and financial data extraction. 
              Enabled by default. Requires OpenAI API key configured on the backend.
            </p>
            {useOpenai && (
              <div className="mt-2 flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="w-3 h-3" />
                <span>Enhanced analysis will be used</span>
              </div>
            )}
          </div>
        </label>
      </Card>

      {onUseExtractedFinancialChange && (
        <Card className="p-4 bg-accent/5 border border-accent/20">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useExtractedFinancial ?? false}
              onChange={(e) => onUseExtractedFinancialChange(e.target.checked)}
              className="w-4 h-4 rounded border-border mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Use Extracted Financial Data
              </p>
              <p className="text-xs text-foreground/70 mt-1">
                If enabled, automatically extracted financial ratios (X₁-X₅) from the document will override your manual inputs. 
                If disabled, your manually entered values will be used.
              </p>
              {(useExtractedFinancial ?? false) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-foreground/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Extracted data will override manual inputs</span>
                </div>
              )}
            </div>
          </label>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-muted/50 rounded-apple">
          <p className="font-medium text-foreground/70 mb-1">File Size</p>
          <p className="text-foreground/60">Max 100MB</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-apple">
          <p className="font-medium text-foreground/70 mb-1">Formats</p>
          <p className="text-foreground/60">PDF, DOCX, TXT</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-apple">
          <p className="font-medium text-foreground/70 mb-1">Pages</p>
          <p className="text-foreground/60">200+ supported</p>
        </div>
      </div>
    </div>
  );
}



