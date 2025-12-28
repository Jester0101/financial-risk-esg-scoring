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
}

