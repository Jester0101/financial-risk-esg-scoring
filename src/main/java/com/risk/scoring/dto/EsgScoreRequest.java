package com.risk.scoring.dto;

public class EsgScoreRequest {
    private String text;

    public EsgScoreRequest() {
    }

    public EsgScoreRequest(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}

