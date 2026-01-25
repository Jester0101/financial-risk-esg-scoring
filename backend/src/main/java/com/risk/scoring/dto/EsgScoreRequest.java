package com.risk.scoring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EsgScoreRequest {
    private String text;
    
    @JsonProperty("use_openai")
    private Boolean useOpenai;
    
    @JsonProperty("openai_key")
    private String openaiKey;

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

    public Boolean getUseOpenai() {
        return useOpenai;
    }

    public void setUseOpenai(Boolean useOpenai) {
        this.useOpenai = useOpenai;
    }

    public String getOpenaiKey() {
        return openaiKey;
    }

    public void setOpenaiKey(String openaiKey) {
        this.openaiKey = openaiKey;
    }
}

