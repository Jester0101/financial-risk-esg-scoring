package com.risk.scoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class EsgScoreResponse {
    private double e;
    private double s;
    private double g;
    
    @JsonProperty("esg_total")
    private double esgTotal;
    
    @JsonProperty("risk_flags")
    private List<String> riskFlags;
    
    @JsonProperty("top_terms")
    private List<String> topTerms;
    
    @JsonProperty("method_version")
    private String methodVersion;

    public EsgScoreResponse() {
    }

    public double getE() {
        return e;
    }

    public void setE(double e) {
        this.e = e;
    }

    public double getS() {
        return s;
    }

    public void setS(double s) {
        this.s = s;
    }

    public double getG() {
        return g;
    }

    public void setG(double g) {
        this.g = g;
    }

    public double getEsgTotal() {
        return esgTotal;
    }

    public void setEsgTotal(double esgTotal) {
        this.esgTotal = esgTotal;
    }

    public List<String> getRiskFlags() {
        return riskFlags;
    }

    public void setRiskFlags(List<String> riskFlags) {
        this.riskFlags = riskFlags;
    }

    public List<String> getTopTerms() {
        return topTerms;
    }

    public void setTopTerms(List<String> topTerms) {
        this.topTerms = topTerms;
    }

    public String getMethodVersion() {
        return methodVersion;
    }

    public void setMethodVersion(String methodVersion) {
        this.methodVersion = methodVersion;
    }
}

