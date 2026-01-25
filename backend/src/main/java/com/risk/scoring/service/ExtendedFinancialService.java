package com.risk.scoring.service;

import com.risk.scoring.model.RiskInput;
import org.springframework.stereotype.Service;

@Service
public class ExtendedFinancialService {

    public double computeExtendedRiskScore(RiskInput input) {
        double totalScore = 0.0;
        int factorsCount = 0;

        if (input.getCurrentRatio() != null) {
            double ratio = input.getCurrentRatio();
            double score = Math.min(1.0, Math.max(0.0, (ratio - 0.5) / 1.5));
            totalScore += score;
            factorsCount++;
        }

        if (input.getDebtToEquity() != null) {
            double ratio = input.getDebtToEquity();
            double score = Math.min(1.0, Math.max(0.0, 1.0 - (ratio / 2.0)));
            totalScore += score;
            factorsCount++;
        }

        if (input.getReturnOnEquity() != null) {
            double roe = input.getReturnOnEquity();
            double score = Math.min(1.0, Math.max(0.0, roe * 5.0));
            totalScore += score;
            factorsCount++;
        }

        if (input.getQuickRatio() != null) {
            double ratio = input.getQuickRatio();
            double score = Math.min(1.0, Math.max(0.0, ratio / 2.0));
            totalScore += score;
            factorsCount++;
        }

        if (input.getEbitdaMargin() != null) {
            double margin = input.getEbitdaMargin();
            double score = Math.min(1.0, Math.max(0.0, margin * 5.0));
            totalScore += score;
            factorsCount++;
        }

        if (factorsCount == 0) {
            return 0.5;
        }

        return totalScore / factorsCount;
    }

    public double computeFinancialMultiplier(RiskInput input) {
        double extendedScore = computeExtendedRiskScore(input);
        return 0.7 + (extendedScore * 0.3);
    }
}

