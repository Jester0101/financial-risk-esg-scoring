package com.risk.scoring.service;

import com.risk.scoring.client.EsgClient;
import com.risk.scoring.dto.EsgScoreResponse;
import com.risk.scoring.model.RiskInput;
import com.risk.scoring.model.RiskResult;
import org.springframework.stereotype.Service;

@Service
public class CompositeRiskService {

    private final EnhancedRiskService enhancedRiskService;
    private final EsgClient esgClient;

    public CompositeRiskService(EnhancedRiskService enhancedRiskService, EsgClient esgClient) {
        this.enhancedRiskService = enhancedRiskService;
        this.esgClient = esgClient;
    }

    public RiskResult calculate(RiskInput input) {
        EsgScoreResponse esgResponse = esgClient.score(input.getEsgText() != null ? input.getEsgText() : "");
        
        RiskResult result = enhancedRiskService.calculate(input, esgResponse.getEsgTotal());
        
        result.setEsgScore(esgResponse.getEsgTotal());
        result.setEsgMethodVersion(esgResponse.getMethodVersion());
        
        String esgExplanation = String.format("E: %.2f, S: %.2f, G: %.2f", 
            esgResponse.getE(), esgResponse.getS(), esgResponse.getG());
        result.setEsgExplanation(esgExplanation);
        
        if (esgResponse.getTopTerms() != null && !esgResponse.getTopTerms().isEmpty()) {
            result.setEsgTopTerms(String.join(", ", esgResponse.getTopTerms()));
        }
        
        if (esgResponse.getRiskFlags() != null && !esgResponse.getRiskFlags().isEmpty()) {
            result.setEsgRiskFlags(String.join(", ", esgResponse.getRiskFlags()));
        }

        return result;
    }

    /**
     * Calculate risk with pre-computed ESG score (from document analysis).
     * This method should be used when ESG score is already calculated from document.
     */
    public RiskResult calculateWithEsgScore(RiskInput input, double esgTotal, String methodVersion, 
                                           double e, double s, double g, 
                                           java.util.List<String> topTerms, 
                                           java.util.List<String> riskFlags,
                                           boolean usesMarketValue,
                                           boolean isNonManufacturing) {
        RiskResult result = enhancedRiskService.calculate(input, esgTotal, usesMarketValue, isNonManufacturing);
        
        result.setEsgScore(esgTotal);
        result.setEsgMethodVersion(methodVersion);
        
        String esgExplanation = String.format("E: %.2f, S: %.2f, G: %.2f", e, s, g);
        result.setEsgExplanation(esgExplanation);
        
        if (topTerms != null && !topTerms.isEmpty()) {
            result.setEsgTopTerms(String.join(", ", topTerms));
        }
        
        if (riskFlags != null && !riskFlags.isEmpty()) {
            result.setEsgRiskFlags(String.join(", ", riskFlags));
        }

        return result;
    }
}

