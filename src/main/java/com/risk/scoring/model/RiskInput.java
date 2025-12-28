package com.risk.scoring.model;

public class RiskInput {
    private double x1;
    private double x2;
    private double x3;
    private double x4;
    private double x5;
    private String esgText;

    public RiskInput() {
    }

    public RiskInput(double x1, double x2, double x3, double x4, double x5, String esgText) {
        this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;
        this.x4 = x4;
        this.x5 = x5;
        this.esgText = esgText;
    }

    public double getX1() {
        return x1;
    }

    public void setX1(double x1) {
        this.x1 = x1;
    }

    public double getX2() {
        return x2;
    }

    public void setX2(double x2) {
        this.x2 = x2;
    }

    public double getX3() {
        return x3;
    }

    public void setX3(double x3) {
        this.x3 = x3;
    }

    public double getX4() {
        return x4;
    }

    public void setX4(double x4) {
        this.x4 = x4;
    }

    public double getX5() {
        return x5;
    }

    public void setX5(double x5) {
        this.x5 = x5;
    }

    public String getEsgText() {
        return esgText;
    }

    public void setEsgText(String esgText) {
        this.esgText = esgText;
    }
}

