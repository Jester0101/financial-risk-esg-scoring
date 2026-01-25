package com.risk.scoring.web;

import com.risk.scoring.client.EsgClient;
import com.risk.scoring.dto.EsgDocumentScoreResponse;
import com.risk.scoring.model.Assessment;
import com.risk.scoring.model.Company;
import com.risk.scoring.model.RiskInput;
import com.risk.scoring.model.RiskResult;
import com.risk.scoring.service.CompanyService;
import com.risk.scoring.service.CompositeRiskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*")
public class RiskApiController {

    private final CompositeRiskService compositeRiskService;
    private final EsgClient esgClient;
    private final CompanyService companyService;

    public RiskApiController(CompositeRiskService compositeRiskService, EsgClient esgClient, CompanyService companyService) {
        this.compositeRiskService = compositeRiskService;
        this.esgClient = esgClient;
        this.companyService = companyService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateRisk(@RequestBody RiskInput input) {
        try {
            RiskResult result = compositeRiskService.calculate(input);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to calculate risk: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping(value = "/calculate-with-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> calculateRiskWithDocument(
            @RequestParam(value = "x1", required = false) Double x1,
            @RequestParam(value = "x2", required = false) Double x2,
            @RequestParam(value = "x3", required = false) Double x3,
            @RequestParam(value = "x4", required = false) Double x4,
            @RequestParam(value = "x5", required = false) Double x5,
            @RequestParam(value = "esgText", required = false) String esgText,
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "currentRatio", required = false) Double currentRatio,
            @RequestParam(value = "debtToEquity", required = false) Double debtToEquity,
            @RequestParam(value = "returnOnEquity", required = false) Double returnOnEquity,
            @RequestParam(value = "quickRatio", required = false) Double quickRatio,
            @RequestParam(value = "ebitdaMargin", required = false) Double ebitdaMargin,
            @RequestPart(value = "esgDocument", required = false) MultipartFile esgDocument,
            @RequestParam(value = "useOpenai", defaultValue = "true") boolean useOpenai,
            @RequestParam(value = "useExtractedFinancial", defaultValue = "false") boolean useExtractedFinancial) {
        
        RiskInput input = new RiskInput();
        boolean x1Provided = x1 != null;
        boolean x2Provided = x2 != null;
        boolean x3Provided = x3 != null;
        boolean x4Provided = x4 != null;
        boolean x5Provided = x5 != null;
        
        if (x1Provided) input.setX1(x1);
        if (x2Provided) input.setX2(x2);
        if (x3Provided) input.setX3(x3);
        if (x4Provided) input.setX4(x4);
        if (x5Provided) input.setX5(x5);
        input.setEsgText(esgText);
        input.setCompanyName(companyName);
        input.setCurrentRatio(currentRatio);
        input.setDebtToEquity(debtToEquity);
        input.setReturnOnEquity(returnOnEquity);
        input.setQuickRatio(quickRatio);
        input.setEbitdaMargin(ebitdaMargin);
        
        try {
            if (esgDocument != null && !esgDocument.isEmpty()) {
                long fileSizeMB = esgDocument.getSize() / (1024 * 1024);
                if (fileSizeMB > 100) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "File too large: " + fileSizeMB + "MB. Maximum size: 100MB");
                    return ResponseEntity.badRequest().body(error);
                }

                byte[] fileContent = esgDocument.getBytes();
                String filename = esgDocument.getOriginalFilename();
                
                com.risk.scoring.dto.FinancialExtractionResponse financialData = 
                    esgClient.extractFinancialData(fileContent, filename);
                
                if (financialData != null) {
                    if ("extracted".equals(financialData.getSource()) 
                        && financialData.getConfidence() != null && financialData.getConfidence() > 0.2) {
                        
                        System.out.println("Using extracted financial data (confidence=" + financialData.getConfidence() + ")");
                        
                        System.out.println("=== Financial Data Processing ===");
                        
                        if (useExtractedFinancial) {
                            System.out.println("useExtractedFinancial is TRUE - will use extracted data to override manual inputs");
                            
                            if (financialData.getX1() != null) {
                                System.out.println(String.format("Overriding X1: %.6f -> %.6f (manual provided=%s)", 
                                    input.getX1(), financialData.getX1(), x1Provided));
                                input.setX1(financialData.getX1());
                            }
                            
                            if (financialData.getX2() != null) {
                                System.out.println(String.format("Overriding X2: %.6f -> %.6f (manual provided=%s)", 
                                    input.getX2(), financialData.getX2(), x2Provided));
                                input.setX2(financialData.getX2());
                            }
                            
                            if (financialData.getX3() != null) {
                                System.out.println(String.format("Overriding X3: %.6f -> %.6f (manual provided=%s)", 
                                    input.getX3(), financialData.getX3(), x3Provided));
                                input.setX3(financialData.getX3());
                            }
                            
                            if (financialData.getX4() != null) {
                                System.out.println(String.format("Overriding X4: %.6f -> %.6f (manual provided=%s)", 
                                    input.getX4(), financialData.getX4(), x4Provided));
                                input.setX4(financialData.getX4());
                            }
                            
                            if (financialData.getX5() != null) {
                                System.out.println(String.format("Overriding X5: %.6f -> %.6f (manual provided=%s)", 
                                    input.getX5(), financialData.getX5(), x5Provided));
                                input.setX5(financialData.getX5());
                            }
                        } else {
                            System.out.println("useExtractedFinancial is FALSE - keeping all manual inputs (ignoring extracted data)");
                            System.out.println(String.format("Manual inputs: X1=%.6f (provided=%s), X2=%.6f (provided=%s), X3=%.6f (provided=%s), X4=%.6f (provided=%s), X5=%.6f (provided=%s)", 
                                input.getX1(), x1Provided,
                                input.getX2(), x2Provided,
                                input.getX3(), x3Provided,
                                input.getX4(), x4Provided,
                                input.getX5(), x5Provided));
                        }
                        
                        System.out.println("=== Processing Complete ===");
                        System.out.println(String.format("Final values: X1=%.6f, X2=%.6f, X3=%.6f, X4=%.6f, X5=%.6f", 
                            input.getX1(), input.getX2(), input.getX3(), input.getX4(), input.getX5()));
                        
                        int ratiosSet = 0;
                        if (financialData.getCurrentRatio() != null) {
                            input.setCurrentRatio(financialData.getCurrentRatio());
                            ratiosSet++;
                        }
                        if (financialData.getDebtToEquity() != null) {
                            input.setDebtToEquity(financialData.getDebtToEquity());
                            ratiosSet++;
                        }
                        if (financialData.getReturnOnEquity() != null) {
                            input.setReturnOnEquity(financialData.getReturnOnEquity());
                            ratiosSet++;
                        }
                        if (financialData.getQuickRatio() != null) {
                            input.setQuickRatio(financialData.getQuickRatio());
                            ratiosSet++;
                        }
                        if (financialData.getEbitdaMargin() != null) {
                            input.setEbitdaMargin(financialData.getEbitdaMargin());
                            ratiosSet++;
                        }
                        
                        System.out.println(String.format(
                            "Financial extraction: confidence=%.2f, ratios extracted=%d (currentRatio=%s, debtToEquity=%s, roe=%s, quickRatio=%s, ebitdaMargin=%s)",
                            financialData.getConfidence(), ratiosSet,
                            financialData.getCurrentRatio(), financialData.getDebtToEquity(), 
                            financialData.getReturnOnEquity(), financialData.getQuickRatio(), 
                            financialData.getEbitdaMargin()
                        ));
                    } else {
                        if (!useExtractedFinancial) {
                            System.out.println("Financial extraction available but disabled by user (useExtractedFinancial=false)");
                            System.out.println(String.format("Using manual inputs: X1=%.6f, X2=%.6f, X3=%.6f, X4=%.6f, X5=%.6f", 
                                input.getX1(), input.getX2(), input.getX3(), input.getX4(), input.getX5()));
                        } else {
                            System.out.println(String.format(
                                "Financial extraction skipped: source=%s, confidence=%s (threshold=0.2)",
                                financialData.getSource(), financialData.getConfidence()
                            ));
                            System.out.println(String.format("Using manual inputs: X1=%.6f, X2=%.6f, X3=%.6f, X4=%.6f, X5=%.6f", 
                                input.getX1(), input.getX2(), input.getX3(), input.getX4(), input.getX5()));
                        }
                    }
                }
                
                boolean usesMarketValue = true;
                boolean isNonManufacturing = false;
                
                boolean x4WasProvidedManually = x4Provided && (x4 != null && x4 != 0.0);
                
                boolean x4WasOverridden = useExtractedFinancial && financialData != null && financialData.getX4() != null;
                
                if (x4WasProvidedManually && !x4WasOverridden) {
                    usesMarketValue = true;
                    System.out.println("X4 was provided manually and not overridden - assuming Market Value (using original Z-Score formula)");
                } else if (x4WasOverridden || (!x4WasProvidedManually && financialData != null)) {
                    if (financialData != null && financialData.getExtractionDetails() != null) {
                        Map<String, Object> details = financialData.getExtractionDetails();
                        Object x4UsesMarketValue = details.get("x4_uses_market_value");
                        if (x4UsesMarketValue instanceof Boolean) {
                            usesMarketValue = (Boolean) x4UsesMarketValue;
                            System.out.println("X4 from extraction - uses Market Value: " + usesMarketValue + 
                                (usesMarketValue ? " (original Z-Score)" : " (Z'-Score)"));
                        } else {
                            usesMarketValue = true;
                            System.out.println("X4 from extraction but x4_uses_market_value not specified - defaulting to Market Value (original Z-Score)");
                        }
                    }
                } else {
                    usesMarketValue = true;
                    System.out.println("No extraction data - defaulting to Market Value (original Z-Score formula)");
                }
                
                EsgDocumentScoreResponse docResponse = esgClient.scoreDocument(fileContent, filename, useOpenai);

                if (docResponse != null) {
                    RiskResult result = compositeRiskService.calculateWithEsgScore(
                        input,
                        docResponse.getEsgTotal(),  // Use ESG score from document
                        docResponse.getMethodVersion(),
                        docResponse.getE(),
                        docResponse.getS(),
                        docResponse.getG(),
                        docResponse.getTopTerms(),
                        docResponse.getRiskFlags(),
                        usesMarketValue,
                        isNonManufacturing
                    );

                    Map<String, Object> response = new HashMap<>();
                    response.put("result", result);
                    response.put("documentStats", docResponse.getDocumentStats());
                    response.put("documentSections", docResponse.getSections());
                    
                    if (financialData != null) {
                        Map<String, Object> financialInfo = new HashMap<>();
                        financialInfo.put("extracted", "extracted".equals(financialData.getSource()));
                        financialInfo.put("confidence", financialData.getConfidence());
                        
                        Map<String, Object> details = new HashMap<>();
                        if (financialData.getExtractionDetails() != null) {
                            details.putAll(financialData.getExtractionDetails());
                        }
                        if (financialData.getCurrentRatio() != null) {
                            details.put("current_ratio", financialData.getCurrentRatio());
                        }
                        if (financialData.getDebtToEquity() != null) {
                            details.put("debt_to_equity", financialData.getDebtToEquity());
                        }
                        if (financialData.getReturnOnEquity() != null) {
                            details.put("return_on_equity", financialData.getReturnOnEquity());
                        }
                        if (financialData.getQuickRatio() != null) {
                            details.put("quick_ratio", financialData.getQuickRatio());
                        }
                        if (financialData.getEbitdaMargin() != null) {
                            details.put("ebitda_margin", financialData.getEbitdaMargin());
                        }
                        financialInfo.put("extractionDetails", details);
                        response.put("financialExtraction", financialInfo);
                    }

                    if (input.getCompanyName() != null && !input.getCompanyName().trim().isEmpty()) {
                        try {
                            System.out.println("Saving assessment for company: " + input.getCompanyName());
                            saveAssessment(input, result, response);
                            System.out.println("Assessment saved successfully");
                        } catch (Exception e) {
                            System.err.println("Failed to save assessment: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("Company name not provided, skipping assessment save");
                    }

                    return ResponseEntity.ok(response);
                }
            }

            RiskResult result = compositeRiskService.calculate(input);
            
            if (input.getCompanyName() != null && !input.getCompanyName().trim().isEmpty()) {
                try {
                    System.out.println("Saving assessment for company: " + input.getCompanyName());
                    saveAssessment(input, result, null);
                    System.out.println("Assessment saved successfully");
                } catch (Exception e) {
                    System.err.println("Failed to save assessment: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Company name not provided, skipping assessment save");
            }
            
            return ResponseEntity.ok(result);

        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process document: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to calculate risk: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Health check endpoint
     * GET /api/risk/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "Risk Scoring API");
        return ResponseEntity.ok(status);
    }

    /**
     * Helper method to save assessment after calculation
     */
    private void saveAssessment(RiskInput input, RiskResult result, Map<String, Object> responseMetadata) {
        try {
            System.out.println("=== Starting saveAssessment ===");
            System.out.println("Input companyName: " + input.getCompanyName());
            
            if (input.getCompanyName() == null || input.getCompanyName().trim().isEmpty()) {
                System.err.println("ERROR: Company name is null or empty, cannot save assessment");
                return;
            }
            
            String companyName = input.getCompanyName().trim();
            System.out.println("Looking for company: " + companyName);
            
            Company company = companyService.findCompanyByName(companyName)
                    .orElse(null);

            if (company == null) {
                System.out.println("Company not found, creating new: " + companyName);
                company = new Company(companyName, null, null);
                company = companyService.createCompany(company);
                System.out.println("Company created with ID: " + company.getId());
            } else {
                System.out.println("Company found with ID: " + company.getId());
            }

        Assessment assessment = new Assessment();
        assessment.setCompanyId(company.getId());
        assessment.setCompanyName(companyName);
        assessment.setInput(input);
        assessment.setResult(result);

        if (responseMetadata != null) {
            Assessment.AssessmentResponseMetadata metadata = new Assessment.AssessmentResponseMetadata();
            
            if (responseMetadata.containsKey("documentStats")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> docStats = (Map<String, Object>) responseMetadata.get("documentStats");
                Assessment.AssessmentResponseMetadata.DocumentStats stats = 
                    new Assessment.AssessmentResponseMetadata.DocumentStats();
                if (docStats.containsKey("filename")) {
                    stats.setFilename((String) docStats.get("filename"));
                }
                if (docStats.containsKey("file_size_mb")) {
                    stats.setFileSizeMb(((Number) docStats.get("file_size_mb")).doubleValue());
                }
                if (docStats.containsKey("num_pages")) {
                    stats.setNumPages(((Number) docStats.get("num_pages")).intValue());
                }
                if (docStats.containsKey("text_words")) {
                    stats.setTextWords(((Number) docStats.get("text_words")).intValue());
                }
                metadata.setDocumentStats(stats);
            }

            if (responseMetadata.containsKey("documentSections")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> sections = (Map<String, Object>) responseMetadata.get("documentSections");
                metadata.setDocumentSections(sections);
            }

            if (responseMetadata.containsKey("financialExtraction")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> finExt = (Map<String, Object>) responseMetadata.get("financialExtraction");
                Assessment.AssessmentResponseMetadata.FinancialExtractionInfo finInfo = 
                    new Assessment.AssessmentResponseMetadata.FinancialExtractionInfo();
                if (finExt.containsKey("extracted")) {
                    finInfo.setExtracted((Boolean) finExt.get("extracted"));
                }
                if (finExt.containsKey("confidence")) {
                    finInfo.setConfidence(((Number) finExt.get("confidence")).doubleValue());
                }
                if (finExt.containsKey("extractionDetails")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> details = (Map<String, Object>) finExt.get("extractionDetails");
                    finInfo.setExtractionDetails(details);
                }
                metadata.setFinancialExtraction(finInfo);
            }

            assessment.setMetadata(metadata);
            System.out.println("Metadata added to assessment");
        }

        System.out.println("Saving assessment to database...");
        Assessment saved = companyService.createAssessment(assessment);
        System.out.println("Assessment saved with ID: " + saved.getId());
        System.out.println("=== saveAssessment completed successfully ===");
        } catch (Exception e) {
            System.err.println("ERROR in saveAssessment: " + e.getMessage());
            System.err.println("Exception type: " + e.getClass().getName());
            e.printStackTrace();
            throw e;
        }
    }
}

