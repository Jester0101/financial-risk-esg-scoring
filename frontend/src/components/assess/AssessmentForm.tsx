"use client";

import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/assess/FileUpload";
import { FinancialInputs } from "@/components/assess/FinancialInputs";
import { 
  calculateRisk, 
  calculateRiskWithDocument, 
  AssessmentResponse, 
  RiskInput,
  extractFinancialData,
  type FinancialExtractionResponse
} from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";

interface AssessmentFormProps {
  onSubmit: (result: AssessmentResponse) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

export function AssessmentForm({ onSubmit, onError, onLoading }: AssessmentFormProps) {
  const [step, setStep] = useState<"financial" | "esg" | "review">("financial");
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");

  const [x1, setX1] = useState("");
  const [x2, setX2] = useState("");
  const [x3, setX3] = useState("");
  const [x4, setX4] = useState("");
  const [x5, setX5] = useState("");

  const [esgMode, setEsgMode] = useState<"text" | "file">("file");
  const [esgText, setEsgText] = useState("");
  const [esgFile, setEsgFile] = useState<File | null>(null);
  const [useOpenai, setUseOpenai] = useState(true);
  const [useExtractedFinancial, setUseExtractedFinancial] = useState(false);
  
  const [extractingFinancial, setExtractingFinancial] = useState(false);
  const [financialExtraction, setFinancialExtraction] = useState<FinancialExtractionResponse | null>(null);

  const handleFileChange = async (file: File | null) => {
    setEsgFile(file);
    setFinancialExtraction(null);
    
    if (file) {
      setExtractingFinancial(true);
      try {
        const extraction = await extractFinancialData(file);
        setFinancialExtraction(extraction);
        
        if (extraction.source === "extracted" && extraction.confidence > 0.3) {
          if (extraction.x1 !== null && extraction.x1 !== undefined) setX1(extraction.x1.toString());
          if (extraction.x2 !== null && extraction.x2 !== undefined) setX2(extraction.x2.toString());
          if (extraction.x3 !== null && extraction.x3 !== undefined) setX3(extraction.x3.toString());
          if (extraction.x4 !== null && extraction.x4 !== undefined) setX4(extraction.x4.toString());
          if (extraction.x5 !== null && extraction.x5 !== undefined) setX5(extraction.x5.toString());
        }
      } catch (err: any) {
        console.warn("Financial extraction failed:", err.message);
        setFinancialExtraction({
          source: "not_found",
          confidence: 0.0,
          extraction_details: {
            reason: err.message || "Extraction failed"
          }
        } as FinancialExtractionResponse);
      } finally {
        setExtractingFinancial(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const hasAnyFinancialData = (x1 && x1.trim()) || (x2 && x2.trim()) || 
                                (x3 && x3.trim()) || (x4 && x4.trim()) || 
                                (x5 && x5.trim());
    const hasDocument = esgFile !== null;
    
    if (!hasAnyFinancialData && !hasDocument) {
      onError("Please either fill in at least one financial ratio (X1-X5) or upload an Annual Report document for automatic extraction.");
      return;
    }
    
    setLoading(true);
    onLoading(true);

    try {
      const input: RiskInput = {
        x1: x1 && x1.trim() ? parseFloat(x1) : 0,
        x2: x2 && x2.trim() ? parseFloat(x2) : 0,
        x3: x3 && x3.trim() ? parseFloat(x3) : 0,
        x4: x4 && x4.trim() ? parseFloat(x4) : 0,
        x5: x5 && x5.trim() ? parseFloat(x5) : 0,
        companyName: companyName.trim() || undefined,
      };

      if (financialExtraction && financialExtraction.source === "extracted") {
        if (financialExtraction.current_ratio != null) input.currentRatio = financialExtraction.current_ratio;
        if (financialExtraction.debt_to_equity != null) input.debtToEquity = financialExtraction.debt_to_equity;
        if (financialExtraction.return_on_equity != null) input.returnOnEquity = financialExtraction.return_on_equity;
        if (financialExtraction.quick_ratio != null) input.quickRatio = financialExtraction.quick_ratio;
        if (financialExtraction.ebitda_margin != null) input.ebitdaMargin = financialExtraction.ebitda_margin;
      }

      let response: AssessmentResponse;

      if (esgFile) {
        response = await calculateRiskWithDocument(
          input, 
          esgFile, 
          esgText || undefined, 
          useOpenai,
          useExtractedFinancial
        );
      } 
      else if (esgText) {
        input.esgText = esgText;
        const result = await calculateRisk(input);
        response = { result };
      }
      else {
        const result = await calculateRisk(input);
        response = { result };
      }

      onSubmit(response);
    } catch (err: any) {
      onError(err.message || "Failed to calculate risk");
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const canProceed = () => {
    if (step === "financial") {
      return true;
    }
    if (step === "esg") return true;
    return true;
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Input
            label="Company Name (Optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Apple Inc."
            helperText="Enter company name to save assessment to company profile"
          />
        </div>

         <div className="flex items-center justify-between mb-8">
           {[
             { key: "financial", label: "Financial" },
             { key: "esg", label: "ESG" },
             { key: "review", label: "Review" },
           ].map((s, i) => (
             <div key={s.key} className="flex items-center flex-1">
               <button
                 type="button"
                 onClick={() => setStep(s.key as any)}
                 className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-all ${
                   step === s.key
                     ? "bg-primary text-white"
                     : "bg-secondary text-foreground/50"
                 }`}
               >
                 {i + 1}
               </button>
               {i < 2 && (
                 <div
                   className={`flex-1 h-0.5 mx-2 ${
                     step === "esg" && i === 0
                       ? "bg-primary"
                       : step === "review" && i < 2
                       ? "bg-primary"
                       : "bg-border"
                   }`}
                 />
               )}
             </div>
           ))}
         </div>

        {step === "financial" && (
          <FinancialInputs
            x1={x1}
            setX1={setX1}
            x2={x2}
            setX2={setX2}
            x3={x3}
            setX3={setX3}
            x4={x4}
            setX4={setX4}
            x5={x5}
            setX5={setX5}
          />
        )}

        {step === "esg" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">ESG Analysis</h3>
              
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-apple mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div className="text-sm text-foreground/80">
                    <p className="font-medium mb-2">What gets analyzed:</p>
                    <ul className="space-y-1 text-xs text-foreground/70 list-disc list-inside">
                      <li><strong>Environmental (E):</strong> Climate initiatives, emissions, renewable energy, sustainability</li>
                      <li><strong>Social (S):</strong> Employee wellbeing, diversity, community impact, human rights</li>
                      <li><strong>Governance (G):</strong> Board structure, ethics, compliance, transparency</li>
                    </ul>
                    <p className="mt-3 text-xs text-foreground/60">
                      <strong>Note:</strong> Only realized incidents (fines, sanctions, lawsuits) increase risk. 
                      Risk management disclosure does not penalize the score.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setEsgMode("file")}
                className={`flex-1 py-4 px-6 rounded-apple border-2 transition-all ${
                  esgMode === "file"
                    ? "border-primary bg-primary/10 shadow-apple"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold mb-1">📄 Upload Annual Report</div>
                  <div className="text-xs text-foreground/60">
                    Recommended: Full ESG analysis from PDF
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setEsgMode("text")}
                className={`flex-1 py-4 px-6 rounded-apple border-2 transition-all ${
                  esgMode === "text"
                    ? "border-primary bg-primary/10 shadow-apple"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold mb-1">📝 Paste ESG Text</div>
                  <div className="text-xs text-foreground/60">
                    Quick: Copy-paste relevant sections
                  </div>
                </div>
              </button>
            </div>

            {esgMode === "file" ? (
              <div className="space-y-4">
                <FileUpload
                  file={esgFile}
                  onFileChange={handleFileChange}
                  useOpenai={useOpenai}
                  onUseOpenaiChange={setUseOpenai}
                  useExtractedFinancial={useExtractedFinancial}
                  onUseExtractedFinancialChange={setUseExtractedFinancial}
                />
                
                {extractingFinancial && (
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-apple">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                      <div>
                        <p className="text-sm font-medium">Extracting financial data...</p>
                        <p className="text-xs text-foreground/60 mt-1">
                          Analyzing document for Altman Z-Score components
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {financialExtraction && financialExtraction.source === "extracted" && (
                  <div className="p-4 bg-success/5 border border-success/20 rounded-apple">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Financial data extracted successfully
                        </p>
                        <p className="text-xs text-foreground/70 mb-2">
                          Confidence: {(financialExtraction.confidence * 100).toFixed(0)}%
                        </p>
                        <div className="text-xs text-foreground/60 space-y-1">
                          {financialExtraction.x1 !== null && financialExtraction.x1 !== undefined && (
                            <div>X₁: {financialExtraction.x1.toFixed(3)}</div>
                          )}
                          {financialExtraction.x2 !== null && financialExtraction.x2 !== undefined && (
                            <div>X₂: {financialExtraction.x2.toFixed(3)}</div>
                          )}
                          {financialExtraction.x3 !== null && financialExtraction.x3 !== undefined && (
                            <div>X₃: {financialExtraction.x3.toFixed(3)}</div>
                          )}
                          {financialExtraction.x4 !== null && financialExtraction.x4 !== undefined && (
                            <div>X₄: {financialExtraction.x4.toFixed(3)}</div>
                          )}
                          {financialExtraction.x5 !== null && financialExtraction.x5 !== undefined && (
                            <div>X₅: {financialExtraction.x5.toFixed(3)}</div>
                          )}
                        </div>
                        <p className="text-xs text-foreground/60 mt-2">
                          Fields have been auto-filled. You can adjust values manually if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {esgFile && (
                  <div className="pt-4 border-t border-border">
                    <label className="block text-sm font-medium mb-2">
                      Additional ESG Text (Optional)
                    </label>
                    <Textarea
                      value={esgText}
                      onChange={(e) => setEsgText(e.target.value)}
                      placeholder="You can add additional ESG text to supplement the document analysis..."
                      rows={4}
                      className="text-sm"
                    />
                    <p className="text-xs text-foreground/60 mt-2">
                      This text will be analyzed together with the document content.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ESG-Related Text
                  </label>
                  <Textarea
                    value={esgText}
                    onChange={(e) => setEsgText(e.target.value)}
                    placeholder="Paste ESG-related content from company reports, sustainability statements, governance documents, or annual reports...

Examples:
• Environmental initiatives and carbon reduction targets
• Social responsibility programs and employee policies
• Governance structure and compliance measures
• Any ESG-related disclosures or statements"
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-foreground/60">
                    <span>
                      {esgText.length > 0 ? `${esgText.length} characters` : "Optional - can be skipped"}
                    </span>
                    {esgText.length > 0 && (
                      <span className="text-success">
                        ✓ Ready for analysis
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-apple">
                  <p className="text-xs text-foreground/70">
                    <strong>Tip:</strong> For best results, include text covering all three ESG dimensions 
                    (Environmental, Social, Governance). The more comprehensive the input, the more accurate the analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

         {step === "review" && (
           <div className="space-y-6">
             <div>
               <h3 className="text-xl font-semibold mb-2">Review & Calculate</h3>
               <p className="text-sm text-foreground/70">
                 Review your inputs before calculating the risk assessment.
               </p>
             </div>

             <div className="space-y-4">
               <Card className="p-5 bg-muted/30">
                 <h4 className="font-semibold mb-3 text-foreground">Financial Data</h4>
                 <div className="grid grid-cols-2 gap-3 text-sm">
                   <div>
                     <span className="text-foreground/60">X₁ (Working Capital):</span>
                     <span className="ml-2 font-medium">{x1 || "—"}</span>
                   </div>
                   <div>
                     <span className="text-foreground/60">X₂ (Retained Earnings):</span>
                     <span className="ml-2 font-medium">{x2 || "—"}</span>
                   </div>
                   <div>
                     <span className="text-foreground/60">X₃ (EBIT):</span>
                     <span className="ml-2 font-medium">{x3 || "—"}</span>
                   </div>
                   <div>
                     <span className="text-foreground/60">X₄ (Market Value):</span>
                     <span className="ml-2 font-medium">{x4 || "—"}</span>
                   </div>
                   <div className="col-span-2">
                     <span className="text-foreground/60">X₅ (Sales):</span>
                     <span className="ml-2 font-medium">{x5 || "—"}</span>
                   </div>
                 </div>
                 <div className="mt-3 pt-3 border-t border-border">
                   <p className="text-xs text-foreground/60">
                     Additional ratios (Current Ratio, Debt-to-Equity, ROE) will be extracted 
                     automatically if an Annual Report PDF is uploaded.
                   </p>
                 </div>
               </Card>

               <Card className="p-5 bg-muted/30">
                 <h4 className="font-semibold mb-3 text-foreground">ESG Data</h4>
                 {esgMode === "file" && esgFile ? (
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-success" />
                       <span className="text-sm font-medium">{esgFile.name}</span>
                     </div>
                     <div className="text-xs text-foreground/60">
                       {(esgFile.size / (1024 * 1024)).toFixed(2)} MB • 
                       {useOpenai ? " GPT-4o analysis enabled" : " Basic analysis"}
                     </div>
                     <div className="text-xs text-foreground/70 mt-2">
                       The document will be analyzed for ESG factors (E, S, G) and financial data extraction.
                     </div>
                   </div>
                 ) : esgText ? (
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-success" />
                       <span className="text-sm font-medium">Text input provided</span>
                     </div>
                     <div className="text-xs text-foreground/60">
                       {esgText.length} characters • {esgText.split(/\s+/).length} words
                     </div>
                     <div className="text-xs text-foreground/70 mt-2">
                       Text will be analyzed using NLP (lexicon, TF-IDF, GPT-4o) for ESG scoring.
                     </div>
                   </div>
                 ) : (
                   <div className="text-sm text-foreground/60">
                     No ESG data provided (optional)
                   </div>
                 )}
               </Card>
             </div>

             <div className="p-4 bg-accent/5 border border-accent/20 rounded-apple">
               <p className="text-sm text-foreground/80">
                 <strong>Ready to calculate:</strong> Click &quot;Calculate Risk&quot; to generate the comprehensive 
                 risk assessment. The analysis will include Altman Z-Score, Probability of Default, 
                 and ESG-adjusted risk score.
               </p>
             </div>
           </div>
         )}

        <div className="flex justify-between pt-6 border-t border-border">
           <Button
             type="button"
             variant="outline"
             onClick={() => {
               const steps: ("financial" | "esg" | "review")[] = ["financial", "esg", "review"];
               const currentIndex = steps.indexOf(step);
               if (currentIndex > 0) {
                 setStep(steps[currentIndex - 1]);
               }
             }}
             disabled={step === "financial"}
           >
             Previous
           </Button>

           {step !== "review" ? (
             <Button
               type="button"
               onClick={() => {
                 const steps: ("financial" | "esg" | "review")[] = ["financial", "esg", "review"];
                 const currentIndex = steps.indexOf(step);
                 setStep(steps[currentIndex + 1]);
               }}
               disabled={!canProceed()}
             >
               Next
             </Button>
           ) : (
             <Button type="submit" disabled={loading || !canProceed()}>
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Calculating...
                 </>
               ) : (
                 "Calculate Risk"
               )}
             </Button>
           )}
        </div>
      </form>
    </Card>
  );
}



