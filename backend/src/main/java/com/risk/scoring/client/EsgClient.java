package com.risk.scoring.client;

import com.risk.scoring.config.EsgServiceConfig;
import com.risk.scoring.dto.EsgScoreRequest;
import com.risk.scoring.dto.EsgScoreResponse;
import com.risk.scoring.dto.EsgDocumentScoreResponse;
import com.risk.scoring.dto.FinancialExtractionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
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

    public EsgDocumentScoreResponse scoreDocument(byte[] fileContent, String filename, boolean useOpenai) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(fileContent) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            builder.part("use_openai", useOpenai);

            MultiValueMap<String, HttpEntity<?>> parts = builder.build();

            EsgDocumentScoreResponse response = webClient.post()
                    .uri("/esg/score-document")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(parts))
                    .retrieve()
                    .bodyToMono(EsgDocumentScoreResponse.class)
                    .timeout(Duration.ofMillis(config.getTimeoutMs() * 3))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(100)))
                    .block();

            if (response != null) {
                logger.info("ESG document scoring successful, method: {}", response.getMethodVersion());
                return response;
            }
        } catch (Exception e) {
            logger.warn("ESG document service unavailable: {}", e.getMessage());
        }

        return createFallbackDocumentResponse();
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

    private EsgDocumentScoreResponse createFallbackDocumentResponse() {
        EsgDocumentScoreResponse fallback = new EsgDocumentScoreResponse();
        fallback.setE(0.5);
        fallback.setS(0.5);
        fallback.setG(0.5);
        fallback.setEsgTotal(0.5);
        fallback.setRiskFlags(Collections.emptyList());
        fallback.setTopTerms(Collections.emptyList());
        fallback.setMethodVersion("fallback");
        fallback.setSections(Collections.emptyMap());
        return fallback;
    }

    
    public FinancialExtractionResponse extractFinancialData(byte[] fileContent, String filename) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(fileContent) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });

            MultiValueMap<String, HttpEntity<?>> parts = builder.build();

            FinancialExtractionResponse response = webClient.post()
                    .uri("/financial/extract")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(parts))
                    .retrieve()
                    .bodyToMono(FinancialExtractionResponse.class)
                    .timeout(Duration.ofMillis(config.getTimeoutMs() * 5))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofMillis(500)))
                    .block();

            if (response != null && "extracted".equals(response.getSource())) {
                logger.info("Financial data extraction successful, confidence: {}", response.getConfidence());
                return response;
            }
        } catch (Exception e) {
            logger.warn("Financial extraction service unavailable: {}", e.getMessage());
        }

        return createFallbackFinancialResponse();
    }

    private FinancialExtractionResponse createFallbackFinancialResponse() {
        FinancialExtractionResponse fallback = new FinancialExtractionResponse();
        fallback.setSource("not_found");
        fallback.setConfidence(0.0);
        fallback.setExtractionDetails(Collections.emptyMap());
        return fallback;
    }
}

