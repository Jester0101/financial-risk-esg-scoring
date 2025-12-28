package com.risk.scoring.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class EsgScoringService {

    private static final String[] POSITIVE_KEYWORDS = {
        "sustainability", "renewable", "green", "carbon neutral", "recycling",
        "diversity", "inclusion", "ethical", "transparency", "governance",
        "social responsibility", "community", "employee wellbeing", "safety",
        "environmental protection", "clean energy", "renewable energy", "solar", "wind"
    };

    private static final String[] NEGATIVE_KEYWORDS = {
        "pollution", "emissions", "waste", "contamination", "violation",
        "scandal", "corruption", "exploitation", "discrimination", "unsafe",
        "hazardous", "toxic", "lawsuit", "fine", "penalty", "breach"
    };

    public EsgResult score(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new EsgResult(0.5, "No ESG text provided");
        }

        String lowerText = text.toLowerCase(Locale.ROOT);
        List<String> foundKeywords = new ArrayList<>();

        int positiveCount = 0;
        int negativeCount = 0;

        for (String keyword : POSITIVE_KEYWORDS) {
            if (lowerText.contains(keyword.toLowerCase(Locale.ROOT))) {
                positiveCount++;
                foundKeywords.add(keyword);
            }
        }

        for (String keyword : NEGATIVE_KEYWORDS) {
            if (lowerText.contains(keyword.toLowerCase(Locale.ROOT))) {
                negativeCount++;
                foundKeywords.add(keyword);
            }
        }

        double score = 0.5 + (positiveCount * 0.05) - (negativeCount * 0.05);
        score = Math.max(0.0, Math.min(1.0, score));

        String explanation;
        if (foundKeywords.isEmpty()) {
            explanation = "No ESG keywords detected";
        } else {
            explanation = "Keywords found: " + String.join(", ", foundKeywords.subList(0, Math.min(5, foundKeywords.size())));
            if (foundKeywords.size() > 5) {
                explanation += " (+" + (foundKeywords.size() - 5) + " more)";
            }
        }

        return new EsgResult(score, explanation);
    }

    public static class EsgResult {
        private final double score;
        private final String explanation;

        public EsgResult(double score, String explanation) {
            this.score = score;
            this.explanation = explanation;
        }

        public double getScore() {
            return score;
        }

        public String getExplanation() {
            return explanation;
        }
    }
}

