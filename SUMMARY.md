# Project Summary

## What Was Done

### 1. Baseline Altman Z-Score (Objective #1)
- Implemented `AltmanService.java` that calculates Z-Score from 5 financial ratios
- Formula: `Z = 1.2·X1 + 1.4·X2 + 3.3·X3 + 0.6·X4 + 1.0·X5`
- Classifies risk into: Distress (<1.81), Grey (1.81-2.99), Safe (>2.99)

### 2. Enhanced Risk Model (Objective #2)
- Created `EnhancedRiskService.java` with logistic calibration
- Converts Z-Score to probability: `p = 1 / (1 + exp(-(a + b*Z)))`
- Combines financial + ESG: `p_enhanced = 0.7*p_baseline + 0.3*(1-esg_total)`
- Provides baseline vs enhanced comparison

### 3. Python ESG Service (Objective #3)
- Built FastAPI microservice in `esg-service/`
- Lexicon-based NLP (keyword matching, no LLM)
- Scores E, S, G separately, returns total + risk flags + top terms
- Method version: `lexicon-v1`

### 4. Java-Python Integration (Objective #4)
- Created `EsgClient.java` using WebClient for REST calls
- Added `@JsonProperty` annotations to map snake_case JSON to camelCase Java
- Implemented fallback when Python service unavailable
- Integrated ESG scores into enhanced risk model

## How It Works

### Flow:
1. **User Input** → Web form (X1-X5 ratios + ESG text)
2. **Altman Calculation** → Java calculates Z-Score and risk zone
3. **ESG Scoring** → Java calls Python service via REST API
   - Python analyzes text with keyword matching
   - Returns E, S, G scores, total, flags, terms
4. **Enhanced Model** → Java combines:
   - Logistic calibration of Z-Score → baseline probability
   - Weighted fusion with ESG → enhanced probability
5. **Results Display** → UI shows both baseline and enhanced scores

### Key Components:
- **AltmanService**: Baseline Z-Score calculation
- **EsgClient**: REST client calling Python service
- **EnhancedRiskService**: Logistic calibration + fusion
- **CompositeRiskService**: Orchestrates everything
- **Python Service**: FastAPI endpoint for ESG text analysis

### Fallback:
If Python service is down → Uses default ESG score (0.5), shows "fallback" method version, system continues working.

### JSON Mapping Fix:
Python returns `esg_total`, `method_version` (snake_case) → Java maps via `@JsonProperty` annotations to `esgTotal`, `methodVersion` (camelCase).

## Result
Complete risk scoring system with baseline financial analysis + ESG-enhanced model, fully integrated and working.

