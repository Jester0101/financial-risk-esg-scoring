package com.risk.scoring.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "risk.enhanced")
public class RiskEnhancedConfig {
    private double logisticA = 1.5;
    private double logisticB = -1.2;
    private double weightFinancial = 0.7;
    private double weightEsg = 0.3;
    private double esgInfluence = 0.25;
    private double esgMaxAdjustment = 0.30;

    public double getLogisticA() {
        return logisticA;
    }

    public void setLogisticA(double logisticA) {
        this.logisticA = logisticA;
    }

    public double getLogisticB() {
        return logisticB;
    }

    public void setLogisticB(double logisticB) {
        this.logisticB = logisticB;
    }

    public double getWeightFinancial() {
        return weightFinancial;
    }

    public void setWeightFinancial(double weightFinancial) {
        this.weightFinancial = weightFinancial;
    }

    public double getWeightEsg() {
        return weightEsg;
    }

    public void setWeightEsg(double weightEsg) {
        this.weightEsg = weightEsg;
    }

    public double getEsgInfluence() {
        return esgInfluence;
    }

    public void setEsgInfluence(double esgInfluence) {
        this.esgInfluence = esgInfluence;
    }

    public double getEsgMaxAdjustment() {
        return esgMaxAdjustment;
    }

    public void setEsgMaxAdjustment(double esgMaxAdjustment) {
        this.esgMaxAdjustment = esgMaxAdjustment;
    }
}

