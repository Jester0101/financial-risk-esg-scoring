package com.risk.scoring.service;

import org.springframework.stereotype.Service;

@Service
public class AltmanService {

    public enum FormulaVersion {
        ORIGINAL,
        Z_PRIME,
        Z_DOUBLE_PRIME
    }

    public double computeZ(double x1, double x2, double x3, double x4, double x5) {
        return 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
    }

    public double computeZPrime(double x1, double x2, double x3, double x4, double x5) {
        return 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5;
    }

    public double computeZDoublePrime(double x1, double x2, double x3, double x4) {
        return 6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * x4;
    }

    public ZScoreResult computeZWithVersion(double x1, double x2, double x3, double x4, double x5, 
                                           boolean usesMarketValue, boolean isNonManufacturing) {
        if (isNonManufacturing) {
            double z = computeZDoublePrime(x1, x2, x3, x4);
            return new ZScoreResult(z, FormulaVersion.Z_DOUBLE_PRIME);
        } else if (!usesMarketValue) {
            double z = computeZPrime(x1, x2, x3, x4, x5);
            return new ZScoreResult(z, FormulaVersion.Z_PRIME);
        } else {
            double z = computeZ(x1, x2, x3, x4, x5);
            return new ZScoreResult(z, FormulaVersion.ORIGINAL);
        }
    }

    public static class ZScoreResult {
        private final double zScore;
        private final FormulaVersion version;

        public ZScoreResult(double zScore, FormulaVersion version) {
            this.zScore = zScore;
            this.version = version;
        }

        public double getZScore() {
            return zScore;
        }

        public FormulaVersion getVersion() {
            return version;
        }

        public String getVersionName() {
            switch (version) {
                case ORIGINAL:
                    return "Z-Score (Original, 1968)";
                case Z_PRIME:
                    return "Z'-Score (1983, Private Companies)";
                case Z_DOUBLE_PRIME:
                    return "Z''-Score (1995, Non-Manufacturing)";
                default:
                    return "Unknown";
            }
        }
    }

    public String zone(double z) {
        if (z < 1.81) {
            return "Distress Zone";
        } else if (z <= 2.99) {
            return "Grey Zone";
        } else {
            return "Safe Zone";
        }
    }

    public String zoneZPrime(double z) {
        if (z < 1.23) {
            return "Distress Zone";
        } else if (z <= 2.90) {
            return "Grey Zone";
        } else {
            return "Safe Zone";
        }
    }

    public String zoneZDoublePrime(double z) {
        if (z < 1.10) {
            return "Distress Zone";
        } else if (z <= 2.60) {
            return "Grey Zone";
        } else {
            return "Safe Zone";
        }
    }       

    public double computeAdjustedZ(double z, double financialMultiplier) {
        return z * financialMultiplier;
    }
}

