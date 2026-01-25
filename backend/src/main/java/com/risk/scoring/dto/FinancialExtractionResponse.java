package com.risk.scoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class FinancialExtractionResponse {
    private Double x1;  // Working Capital / Total Assets
    private Double x2;  // Retained Earnings / Total Assets
    private Double x3;  // EBIT / Total Assets
    private Double x4;  // Market Value Equity / Total Liabilities
    private Double x5;  // Sales / Total Assets
    
    @JsonProperty("current_ratio")
    private Double currentRatio;
    
    @JsonProperty("debt_to_equity")
    private Double debtToEquity;
    
    @JsonProperty("return_on_equity")
    private Double returnOnEquity;
    
    @JsonProperty("quick_ratio")
    private Double quickRatio;
    
    @JsonProperty("ebitda_margin")
    private Double ebitdaMargin;
    
    private Double confidence;  // 0.0 to 1.0
    private String source;  // "extracted" or "not_found"
    
    @JsonProperty("extraction_details")
    private Map<String, Object> extractionDetails;

    public FinancialExtractionResponse() {
    }

    public Double getX1() {
        return x1;
    }

    public void setX1(Double x1) {
        this.x1 = x1;
    }

    public Double getX2() {
        return x2;
    }

    public void setX2(Double x2) {
        this.x2 = x2;
    }

    public Double getX3() {
        return x3;
    }

    public void setX3(Double x3) {
        this.x3 = x3;
    }

    public Double getX4() {
        return x4;
    }

    public void setX4(Double x4) {
        this.x4 = x4;
    }

    public Double getX5() {
        return x5;
    }

    public void setX5(Double x5) {
        this.x5 = x5;
    }

    public Double getCurrentRatio() {
        return currentRatio;
    }

    public void setCurrentRatio(Double currentRatio) {
        this.currentRatio = currentRatio;
    }

    public Double getDebtToEquity() {
        return debtToEquity;
    }

    public void setDebtToEquity(Double debtToEquity) {
        this.debtToEquity = debtToEquity;
    }

    public Double getReturnOnEquity() {
        return returnOnEquity;
    }

    public void setReturnOnEquity(Double returnOnEquity) {
        this.returnOnEquity = returnOnEquity;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Map<String, Object> getExtractionDetails() {
        return extractionDetails;
    }

    public void setExtractionDetails(Map<String, Object> extractionDetails) {
        this.extractionDetails = extractionDetails;
    }

    public Double getQuickRatio() {
        return quickRatio;
    }

    public void setQuickRatio(Double quickRatio) {
        this.quickRatio = quickRatio;
    }

    public Double getEbitdaMargin() {
        return ebitdaMargin;
    }

    public void setEbitdaMargin(Double ebitdaMargin) {
        this.ebitdaMargin = ebitdaMargin;
    }
}

