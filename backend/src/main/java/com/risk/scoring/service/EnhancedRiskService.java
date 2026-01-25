package com.risk.scoring.service;

import com.risk.scoring.config.RiskEnhancedConfig;
import com.risk.scoring.model.RiskInput;
import com.risk.scoring.model.RiskResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EnhancedRiskService {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedRiskService.class);
    private final AltmanService altmanService;
    private final ExtendedFinancialService extendedFinancialService;
    private final RiskEnhancedConfig config;

    public EnhancedRiskService(
            AltmanService altmanService,
            ExtendedFinancialService extendedFinancialService,
            RiskEnhancedConfig config
    ) {
        this.altmanService = altmanService;
        this.extendedFinancialService = extendedFinancialService;
        this.config = config;
    }

    public RiskResult calculate(RiskInput input, double esgTotal, boolean usesMarketValue, boolean isNonManufacturing) {
        AltmanService.ZScoreResult zResult = altmanService.computeZWithVersion(
                input.getX1(), input.getX2(), input.getX3(), input.getX4(), input.getX5(),
                usesMarketValue, isNonManufacturing
        );
        
        double zScore = zResult.getZScore();
        String formulaVersion = zResult.getVersionName();
        
        logger.info("Using {} for Z-Score calculation (usesMarketValue={}, isNonManufacturing={})", 
            formulaVersion, usesMarketValue, isNonManufacturing);

        boolean hasAdditionalRatios = hasAdditionalRatios(input);
        
        if (hasAdditionalRatios) {
            logger.info("Additional financial ratios detected: currentRatio={}, debtToEquity={}, returnOnEquity={}, quickRatio={}, ebitdaMargin={}",
                input.getCurrentRatio(), input.getDebtToEquity(), input.getReturnOnEquity(), 
                input.getQuickRatio(), input.getEbitdaMargin());
        }
        
        double financialMultiplier = 1.0;
        if (hasAdditionalRatios) {
            financialMultiplier = extendedFinancialService.computeFinancialMultiplier(input);
            logger.info("Financial multiplier calculated: {} (extendedScore used)", financialMultiplier);
        }

        double adjustedZ = hasAdditionalRatios
                ? altmanService.computeAdjustedZ(zScore, financialMultiplier)
                : zScore;
        
        if (hasAdditionalRatios) {
            logger.info("Z-Score adjustment (for PD calculation only): original={}, adjusted={}, multiplier={}", zScore, adjustedZ, financialMultiplier);
            logger.info("NOTE: Displayed Z-Score remains original={} (not adjusted)", zScore);
        }

        String riskZone;
        switch (zResult.getVersion()) {
            case Z_PRIME:
                riskZone = altmanService.zoneZPrime(zScore);
                break;
            case Z_DOUBLE_PRIME:
                riskZone = altmanService.zoneZDoublePrime(zScore);
                break;
            default:
                riskZone = altmanService.zone(zScore);
                break;
        }

        double pBaseline = logisticCalibration(zScore);
        double pAdjusted = hasAdditionalRatios ? logisticCalibration(adjustedZ) : pBaseline;
        double pEnhanced = computeESGAdjustedProbability(pAdjusted, esgTotal);

        RiskResult result = new RiskResult();
        result.setZScore(zScore);
        result.setRiskZone(riskZone);
        result.setEsgScore(esgTotal);
        result.setCompositeScore(pEnhanced);
        result.setPBaseline(pBaseline);
        result.setPAdjusted(pAdjusted);
        result.setPEnhanced(pEnhanced);
        result.setZScoreFormulaVersion(formulaVersion);

        logger.info("Final RiskResult: zScore={} (original, never adjusted), pBaseline={}, pAdjusted={}, pEnhanced={}", 
            result.getZScore(), pBaseline, pAdjusted, pEnhanced);
        if (hasAdditionalRatios) {
            logger.info("Extended Financial Analysis applied: adjustedZ={} used for pAdjusted calculation only, displayed zScore={} unchanged", 
                adjustedZ, result.getZScore());
        }

        return result;
    }

    public RiskResult calculate(RiskInput input, double esgTotal) {
        return calculate(input, esgTotal, true, false);
    }

    private boolean hasAdditionalRatios(RiskInput input) {
        return input.getCurrentRatio() != null
                || input.getDebtToEquity() != null
                || input.getReturnOnEquity() != null
                || input.getQuickRatio() != null
                || input.getEbitdaMargin() != null;
    }

    private double computeESGAdjustedProbability(double pBase, double esgScore) {
        double esg = clamp01(esgScore);

        double k = config.getEsgInfluence();
        double cMax = config.getEsgMaxAdjustment();

        double raw = 0.5 - esg;
        double clipped = clamp(raw, -cMax, cMax);
        double adjustment = k * clipped;

        double pEnhanced = pBase * (1.0 + adjustment);
        return clamp01(pEnhanced);
    }

    private double logisticCalibration(double z) {
        double a = config.getLogisticA();
        double b = config.getLogisticB();

        double exponent = -(a + b * z);
        exponent = clamp(exponent, -60.0, 60.0);

        double pd = 1.0 / (1.0 + Math.exp(exponent));
        return clamp01(pd);
    }

    private double clamp01(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }

    private double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}
