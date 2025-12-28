package com.risk.scoring.client;

import com.risk.scoring.config.EsgServiceConfig;
import com.risk.scoring.dto.EsgScoreRequest;
import com.risk.scoring.dto.EsgScoreResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Collections;

@Component
public class EsgClient {

    private static final Logger logger = LoggerFactory.getLogger(EsgClient.class);
    private final WebClient webClient;
    private final EsgServiceConfig config;

    public EsgClient(EsgServiceConfig config) {
        this.config = config;
        this.webClient = WebClient.builder()
                .baseUrl(config.getBaseUrl())
                .build();
    }

    public EsgScoreResponse score(String text) {
        try {
            EsgScoreRequest request = new EsgScoreRequest(text);
            
            EsgScoreResponse response = webClient.post()
                    .uri("/esg/score")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(EsgScoreResponse.class)
                    .timeout(Duration.ofMillis(config.getTimeoutMs()))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(100)))
                    .block();

            if (response != null) {
                logger.info("ESG scoring successful, method: {}", response.getMethodVersion());
                return response;
            }
        } catch (Exception e) {
            logger.warn("ESG service unavailable, using fallback: {}", e.getMessage());
        }

        return createFallbackResponse();
    }

    private EsgScoreResponse createFallbackResponse() {
        EsgScoreResponse fallback = new EsgScoreResponse();
        fallback.setE(0.5);
        fallback.setS(0.5);
        fallback.setG(0.5);
        fallback.setEsgTotal(0.5);
        fallback.setRiskFlags(Collections.emptyList());
        fallback.setTopTerms(Collections.emptyList());
        fallback.setMethodVersion("fallback");
        return fallback;
    }
}

