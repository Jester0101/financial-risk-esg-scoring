package com.risk.scoring.service;

import com.risk.scoring.config.RiskEnhancedConfig;
import com.risk.scoring.model.RiskInput;
import com.risk.scoring.model.RiskResult;
import org.springframework.stereotype.Service;

@Service
public class EnhancedRiskService {

    private final AltmanService altmanService;
    private final RiskEnhancedConfig config;

    public EnhancedRiskService(AltmanService altmanService, RiskEnhancedConfig config) {
        this.altmanService = altmanService;
        this.config = config;
    }

    public RiskResult calculate(RiskInput input, double esgTotal) {
        double zScore = altmanService.computeZ(input.getX1(), input.getX2(), input.getX3(), input.getX4(), input.getX5());
        String riskZone = altmanService.zone(zScore);

        double pBaseline = logisticCalibration(zScore);

        double pEnhanced = (config.getWeightFinancial() * pBaseline) + (config.getWeightEsg() * (1.0 - esgTotal));

        RiskResult result = new RiskResult();
        result.setZScore(zScore);
        result.setRiskZone(riskZone);
        result.setEsgScore(esgTotal);
        result.setCompositeScore(pEnhanced);
        result.setPBaseline(pBaseline);
        result.setPEnhanced(pEnhanced);

        return result;
    }

    private double logisticCalibration(double z) {
        double a = config.getLogisticA();
        double b = config.getLogisticB();
        double exponent = -(a + b * z);
        return 1.0 / (1.0 + Math.exp(exponent));
    }
}

