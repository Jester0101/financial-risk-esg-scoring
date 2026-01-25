package com.risk.scoring.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "assessments")
public class Assessment {
    @Id
    private String id;
    private String companyId;
    private String companyName;
    private RiskInput input;
    private RiskResult result;
    private AssessmentResponseMetadata metadata;
    private LocalDateTime createdAt;

    public Assessment() {
        this.createdAt = LocalDateTime.now();
    }

    public Assessment(String companyId, String companyName, RiskInput input, RiskResult result) {
        this();
        this.companyId = companyId;
        this.companyName = companyName;
        this.input = input;
        this.result = result;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public RiskInput getInput() {
        return input;
    }

    public void setInput(RiskInput input) {
        this.input = input;
    }

    public RiskResult getResult() {
        return result;
    }

    public void setResult(RiskResult result) {
        this.result = result;
    }

    public AssessmentResponseMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(AssessmentResponseMetadata metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class AssessmentResponseMetadata {
        private DocumentStats documentStats;
        private java.util.Map<String, Object> documentSections;
        private FinancialExtractionInfo financialExtraction;

        public DocumentStats getDocumentStats() {
            return documentStats;
        }

        public void setDocumentStats(DocumentStats documentStats) {
            this.documentStats = documentStats;
        }

        public java.util.Map<String, Object> getDocumentSections() {
            return documentSections;
        }

        public void setDocumentSections(java.util.Map<String, Object> documentSections) {
            this.documentSections = documentSections;
        }

        public FinancialExtractionInfo getFinancialExtraction() {
            return financialExtraction;
        }

        public void setFinancialExtraction(FinancialExtractionInfo financialExtraction) {
            this.financialExtraction = financialExtraction;
        }

        public static class DocumentStats {
            private String filename;
            private Double fileSizeMb;
            private Integer numPages;
            private Integer textWords;

            public String getFilename() {
                return filename;
            }

            public void setFilename(String filename) {
                this.filename = filename;
            }

            public Double getFileSizeMb() {
                return fileSizeMb;
            }

            public void setFileSizeMb(Double fileSizeMb) {
                this.fileSizeMb = fileSizeMb;
            }

            public Integer getNumPages() {
                return numPages;
            }

            public void setNumPages(Integer numPages) {
                this.numPages = numPages;
            }

            public Integer getTextWords() {
                return textWords;
            }

            public void setTextWords(Integer textWords) {
                this.textWords = textWords;
            }
        }

        public static class FinancialExtractionInfo {
            private Boolean extracted;
            private Double confidence;
            private java.util.Map<String, Object> extractionDetails;

            public Boolean getExtracted() {
                return extracted;
            }

            public void setExtracted(Boolean extracted) {
                this.extracted = extracted;
            }

            public Double getConfidence() {
                return confidence;
            }

            public void setConfidence(Double confidence) {
                this.confidence = confidence;
            }

            public java.util.Map<String, Object> getExtractionDetails() {
                return extractionDetails;
            }

            public void setExtractionDetails(java.util.Map<String, Object> extractionDetails) {
                this.extractionDetails = extractionDetails;
            }
        }
    }
}

