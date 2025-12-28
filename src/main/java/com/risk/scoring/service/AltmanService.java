package com.risk.scoring.service;

import org.springframework.stereotype.Service;

@Service
public class AltmanService {

    public double computeZ(double x1, double x2, double x3, double x4, double x5) {
        return 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
    }

    public String zone(double z) {
        if (z < 1.81) return "Distress zone (high risk)";
        if (z <= 2.99) return "Grey zone (moderate risk)";
        return "Safe zone (low risk)";
    }
}

