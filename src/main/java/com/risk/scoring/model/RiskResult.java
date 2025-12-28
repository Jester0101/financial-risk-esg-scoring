package com.risk.scoring.model;

import java.time.LocalDateTime;

public class RiskResult {
    private double zScore;
    private String riskZone;
    private double esgScore;
    private String esgExplanation;
    private double compositeScore;
    private LocalDateTime timestamp;
    private Double pBaseline;
    private Double pEnhanced;
    private String esgMethodVersion;
    private String esgTopTerms;
    private String esgRiskFlags;

    public RiskResult() {
        this.timestamp = LocalDateTime.now();
    }

    public RiskResult(double zScore, String riskZone, double esgScore, String esgExplanation, double compositeScore) {
        this.zScore = zScore;
        this.riskZone = riskZone;
        this.esgScore = esgScore;
        this.esgExplanation = esgExplanation;
        this.compositeScore = compositeScore;
        this.timestamp = LocalDateTime.now();
    }

    public double getZScore() {
        return zScore;
    }

    public void setZScore(double zScore) {
        this.zScore = zScore;
    }

    public String getRiskZone() {
        return riskZone;
    }

    public void setRiskZone(String riskZone) {
        this.riskZone = riskZone;
    }

    public double getEsgScore() {
        return esgScore;
    }

    public void setEsgScore(double esgScore) {
        this.esgScore = esgScore;
    }

    public String getEsgExplanation() {
        return esgExplanation;
    }

    public void setEsgExplanation(String esgExplanation) {
        this.esgExplanation = esgExplanation;
    }

    public double getCompositeScore() {
        return compositeScore;
    }

    public void setCompositeScore(double compositeScore) {
        this.compositeScore = compositeScore;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getPBaseline() {
        return pBaseline;
    }

    public void setPBaseline(Double pBaseline) {
        this.pBaseline = pBaseline;
    }

    public Double getPEnhanced() {
        return pEnhanced;
    }

    public void setPEnhanced(Double pEnhanced) {
        this.pEnhanced = pEnhanced;
    }

    public String getEsgMethodVersion() {
        return esgMethodVersion;
    }

    public void setEsgMethodVersion(String esgMethodVersion) {
        this.esgMethodVersion = esgMethodVersion;
    }

    public String getEsgTopTerms() {
        return esgTopTerms;
    }

    public void setEsgTopTerms(String esgTopTerms) {
        this.esgTopTerms = esgTopTerms;
    }

    public String getEsgRiskFlags() {
        return esgRiskFlags;
    }

    public void setEsgRiskFlags(String esgRiskFlags) {
        this.esgRiskFlags = esgRiskFlags;
    }
}

