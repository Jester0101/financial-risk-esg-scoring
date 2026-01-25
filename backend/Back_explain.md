# Complete Backend System Guide

## Comprehensive Documentation of the Financial Risk & ESG Scoring Backend

This document provides a detailed, step-by-step explanation of how the entire backend system works, including all services, calculations, data flows, and business logic.

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Core Components](#core-components)
4. [Request Processing Flow](#request-processing-flow)
5. [Service Layer Details](#service-layer-details)
6. [Calculation Logic](#calculation-logic)
7. [Data Models](#data-models)
8. [External Integrations](#external-integrations)
9. [Database Integration](#database-integration)
10. [API Endpoints](#api-endpoints)
11. [Error Handling](#error-handling)
12. [Configuration](#configuration)

---

## System Architecture Overview

The backend is a **Spring Boot REST API** that serves as the core orchestration layer for financial risk assessment. It integrates multiple services to:

1. **Process Financial Data**: Calculate Altman Z-Score from financial ratios
2. **Extract Data from Documents**: Use GPT-4o to extract financial ratios from Annual Reports
3. **Analyze ESG Factors**: Score companies based on Environmental, Social, and Governance factors
4. **Calculate Risk**: Convert Z-Score to Probability of Default (PD) and adjust for ESG
5. **Store Results**: Persist company profiles and assessments in MongoDB

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│                    Port 3000                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Backend API (Spring Boot)                      │
│                    Port 8080                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  REST Controllers                                     │  │
│  │  - RiskApiController                                 │  │
│  │  - CompanyController                                 │  │
│  └───────────────┬─────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │  Service Layer                                        │  │
│  │  - CompositeRiskService                              │  │
│  │  - EnhancedRiskService                                │  │
│  │  - AltmanService                                     │  │
│  │  - ExtendedFinancialService                          │  │
│  │  - CompanyService                                    │  │
│  └───────────────┬─────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │  External Client                                      │  │
│  │  - EsgClient (WebClient)                            │  │
│  └───────────────┬─────────────────────────────────────┘  │
│                  │                                           │
└──────────────────┼──────────────────────────────────────────┘
                   │ HTTP (WebClient)
                   │
┌──────────────────▼──────────────────────────────────────────┐
│         ESG Service (Python FastAPI)                        │
│              Port 8000                                       │
│  - Document Parsing                                         │
│  - Financial Data Extraction (GPT-4o)                      │
│  - ESG Scoring (Lexicon + TF-IDF + GPT-4o)                  │
└──────────────────────────────────────────────────────────────┘
                   │
                   │ OpenAI API
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              MongoDB                                         │
│         Port 27017                                           │
│  - Companies Collection                                     │
│  - Assessments Collection                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Framework**: Spring Boot 4.0.1
- **Language**: Java 17+
- **Build Tool**: Maven
- **HTTP Client**: Spring WebFlux (WebClient) for non-blocking HTTP requests
- **Database**: MongoDB (via Spring Data MongoDB)
- **Documentation**: Spring Boot Actuator (optional)
- **Port**: 8080 (configurable in `application.properties`)

---

## Core Components

### 1. REST Controllers

#### `RiskApiController.java`

**Location**: `com.risk.scoring.web.RiskApiController`

**Purpose**: Main entry point for risk calculation requests. Handles:
- Financial data input
- Document uploads (PDF, DOCX, TXT)
- ESG text input
- Request validation
- Response formatting

**Key Endpoints**:
- `POST /api/risk/calculate` - Calculate risk from manual input
- `POST /api/risk/calculate-with-document` - Calculate risk with document upload

**Key Responsibilities**:
1. **Receive and Validate Input**:
   - Accepts X1-X5 financial ratios (optional)
   - Accepts ESG document or text
   - Validates file size (max 100MB)
   - Validates file types (PDF, DOCX, TXT)

2. **Financial Data Processing**:
   - If document uploaded → extract financial data via ESG Service
   - If `useExtractedFinancial = true` → override manual inputs with extracted data
   - If `useExtractedFinancial = false` → keep manual inputs (ignore extracted data)

3. **Formula Selection**:
   - Determines if Market Value or Book Value is used for X4
   - If X4 provided manually → assumes Market Value → uses original Z-Score
   - If X4 extracted from document → checks `extraction_details.x4_uses_market_value`
   - Selects appropriate formula: Original Z-Score, Z'-Score, or Z''-Score

4. **ESG Processing**:
   - If document uploaded → extract ESG score via ESG Service
   - If text provided → score ESG from text
   - If neither → use default ESG score (50.0)

5. **Risk Calculation**:
   - Calls `CompositeRiskService` to calculate risk
   - Returns comprehensive `RiskResult` with all metrics

6. **Assessment Persistence**:
   - If `companyName` provided → saves assessment to MongoDB
   - Links assessment to company profile

#### `CompanyController.java`

**Location**: `com.risk.scoring.web.CompanyController`

**Purpose**: Manages company profiles and assessments

**Key Endpoints**:
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company
- `GET /api/companies/{id}/assessments` - Get company assessments
- `GET /api/companies/assessments/{id}` - Get assessment by ID
- `GET /api/companies/assessments/recent` - Get recent assessments

---

### 2. Service Layer

#### `CompositeRiskService.java`

**Location**: `com.risk.scoring.service.CompositeRiskService`

**Purpose**: Orchestrates risk calculation by coordinating multiple services

**Key Methods**:

1. **`calculate(RiskInput input)`**:
   - Scores ESG from text (if provided)
   - Calls `EnhancedRiskService.calculate()` with default parameters
   - Returns `RiskResult` with ESG details

2. **`calculateWithEsgScore(...)`**:
   - Uses pre-computed ESG score from document analysis
   - Calls `EnhancedRiskService.calculate()` with formula selection parameters
   - Returns `RiskResult` with all details

**Dependencies**:
- `EnhancedRiskService` - Core risk calculation
- `EsgClient` - External ESG service communication

#### `EnhancedRiskService.java`

**Location**: `com.risk.scoring.service.EnhancedRiskService`

**Purpose**: Core risk calculation service. Implements the complete risk assessment pipeline.

**Key Method**: `calculate(RiskInput input, double esgTotal, boolean usesMarketValue, boolean isNonManufacturing)`

**Processing Steps**:

1. **Z-Score Calculation**:
   ```java
   AltmanService.ZScoreResult zResult = altmanService.computeZWithVersion(
       input.getX1(), input.getX2(), input.getX3(), input.getX4(), input.getX5(),
       usesMarketValue, isNonManufacturing
   );
   ```
   - Automatically selects formula version:
     - Original Z-Score (if Market Value)
     - Z'-Score (if Book Value, private companies)
     - Z''-Score (if non-manufacturing)

2. **Extended Financial Analysis**:
   ```java
   if (hasAdditionalRatios) {
       financialMultiplier = extendedFinancialService.computeFinancialMultiplier(input);
       adjustedZ = zScore * financialMultiplier;  // Only for PD calculation!
   }
   ```
   - Checks for additional ratios (Current Ratio, Debt-to-Equity, ROE, etc.)
   - Calculates `financialMultiplier` (0.7 to 1.0)
   - Creates `adjustedZ` for PD calculation (NOT for display)

3. **Risk Zone Classification**:
   ```java
   String riskZone = altmanService.zone(zScore);  // Always uses original zScore
   ```
   - Classifies based on original Z-Score (not adjusted)
   - Uses appropriate zone thresholds for formula version

4. **Probability of Default (PD) Calculation**:
   ```java
   double pBaseline = logisticCalibration(zScore);  // From original Z
   double pAdjusted = hasAdditionalRatios ? logisticCalibration(adjustedZ) : pBaseline;
   double pEnhanced = computeESGAdjustedProbability(pAdjusted, esgTotal);
   ```
   - `pBaseline`: PD from original Z-Score
   - `pAdjusted`: PD from adjusted Z-Score (if extended financial analysis applied)
   - `pEnhanced`: Final PD after ESG adjustment

5. **Result Assembly**:
   ```java
   result.setZScore(zScore);  // ALWAYS original, never adjustedZ
   result.setPBaseline(pBaseline);
   result.setPAdjusted(pAdjusted);
   result.setPEnhanced(pEnhanced);
   ```

**Important Notes**:
- **Z-Score is NEVER adjusted for display** - Extended Financial Analysis affects only PD
- `adjustedZ` is used internally for `pAdjusted` calculation only
- Displayed Z-Score always remains the original calculated value

#### `AltmanService.java`

**Location**: `com.risk.scoring.service.AltmanService`

**Purpose**: Calculates Altman Z-Score using appropriate formula version

**Key Methods**:

1. **`computeZ(x1, x2, x3, x4, x5)`** - Original Z-Score (1968):
   ```java
   Z = 1.2×X₁ + 1.4×X₂ + 3.3×X₃ + 0.6×X₄ + 1.0×X₅
   ```
   - For public manufacturing companies
   - Requires Market Value of Equity for X4

2. **`computeZPrime(x1, x2, x3, x4, x5)`** - Z'-Score (1983):
   ```java
   Z' = 0.717×X₁ + 0.847×X₂ + 3.107×X₃ + 0.420×X₄ + 0.998×X₅
   ```
   - For private companies
   - Uses Book Value of Equity for X4

3. **`computeZDoublePrime(x1, x2, x3, x4)`** - Z''-Score (1995):
   ```java
   Z'' = 6.56×X₁ + 3.26×X₂ + 6.72×X₃ + 1.05×X₄
   ```
   - For non-manufacturing companies
   - Does not use X5 (Sales/Assets)

4. **`computeZWithVersion(...)`** - Automatic formula selection:
   - Checks `isNonManufacturing` → Z''-Score
   - Checks `usesMarketValue` → Original Z-Score or Z'-Score
   - Returns `ZScoreResult` with formula version info

5. **Zone Classification**:
   - `zone(z)` - Original Z-Score thresholds (1.81, 2.99)
   - `zoneZPrime(z)` - Z'-Score thresholds (1.23, 2.90)
   - `zoneZDoublePrime(z)` - Z''-Score thresholds (1.10, 2.60)

#### `ExtendedFinancialService.java`

**Location**: `com.risk.scoring.service.ExtendedFinancialService`

**Purpose**: Calculates financial multiplier based on additional financial ratios

**Key Methods**:

1. **`computeExtendedRiskScore(RiskInput input)`**:
   - Evaluates additional ratios:
     - Current Ratio (higher is better)
     - Debt-to-Equity (lower is better)
     - Return on Equity (higher is better)
     - Quick Ratio (higher is better)
     - EBITDA Margin (higher is better)
   - Maps each ratio to [0, 1] scale
   - Returns average score

2. **`computeFinancialMultiplier(RiskInput input)`**:
   ```java
   multiplier = 0.7 + (extendedScore × 0.3)
   ```
   - Range: [0.7, 1.0]
   - Strong ratios (score=1.0) → multiplier=1.0 (no change)
   - Weak ratios (score=0.0) → multiplier=0.7 (30% reduction)
   - Applied to Z-Score to create `adjustedZ` for PD calculation

**Important**: This multiplier affects PD only, not the displayed Z-Score.

#### `CompanyService.java`

**Location**: `com.risk.scoring.service.CompanyService`

**Purpose**: Manages company profiles and assessments in MongoDB

**Key Methods**:
- `createCompany(...)` - Create new company profile
- `updateCompany(...)` - Update existing company
- `deleteCompany(...)` - Delete company and all assessments
- `getAllCompanies()` - List all companies
- `getCompanyById(...)` - Get company by ID
- `createAssessment(...)` - Save assessment to MongoDB
- `getAssessmentsByCompany(...)` - Get all assessments for a company
- `getAssessmentById(...)` - Get assessment by ID

---

### 3. External Client

#### `EsgClient.java`

**Location**: `com.risk.scoring.client.EsgClient`

**Purpose**: Communicates with Python ESG Service via WebClient (non-blocking)

**Key Methods**:

1. **`extractFinancialData(byte[] fileContent, String filename)`**:
   - Sends document to ESG Service `/financial/extract` endpoint
   - Returns `FinancialExtractionResponse` with:
     - X1-X5 ratios
     - Additional ratios (Current Ratio, Debt-to-Equity, ROE, etc.)
     - Confidence score
     - Extraction details (including `x4_uses_market_value`)

2. **`scoreDocument(byte[] fileContent, String filename, boolean useOpenai)`**:
   - Sends document to ESG Service `/esg/score-document` endpoint
   - Returns `EsgDocumentScoreResponse` with:
     - E, S, G scores
     - Total ESG score
     - Risk flags
     - Top terms
     - Document statistics

3. **`score(String text, boolean useOpenai)`**:
   - Sends text to ESG Service `/esg/score` endpoint
   - Returns `EsgScoreResponse` with ESG scores

**Configuration**:
- Base URL: `http://localhost:8000` (configurable)
- Timeout: 60 seconds
- Uses Spring WebFlux WebClient for non-blocking requests

---

## Request Processing Flow

### Scenario 1: Manual Input Only (No Document)

```
1. Frontend → POST /api/risk/calculate
   └─> RiskApiController.calculateRisk()
       └─> CompositeRiskService.calculate()
           ├─> EsgClient.score() [if ESG text provided]
           └─> EnhancedRiskService.calculate(input, esgTotal, true, false)
               ├─> AltmanService.computeZWithVersion(..., true, false)
               │   └─> Uses Original Z-Score formula
               ├─> ExtendedFinancialService.computeFinancialMultiplier() [if additional ratios]
               ├─> logisticCalibration(zScore) → pBaseline
               ├─> logisticCalibration(adjustedZ) → pAdjusted [if extended analysis]
               └─> computeESGAdjustedProbability(pAdjusted, esgTotal) → pEnhanced
```

### Scenario 2: Document Upload

```
1. Frontend → POST /api/risk/calculate-with-document
   └─> RiskApiController.calculateRiskWithDocument()
       │
       ├─> STEP 1: Extract Financial Data
       │   └─> EsgClient.extractFinancialData()
       │       └─> ESG Service (Python) → GPT-4o → FinancialExtractionResponse
       │           ├─> X1-X5 ratios
       │           ├─> Additional ratios
       │           └─> extraction_details.x4_uses_market_value
       │
       ├─> STEP 2: Process Financial Data
       │   ├─> If useExtractedFinancial = true → override manual inputs
       │   └─> Determine formula: check if X4 was provided manually
       │       ├─> If manual → usesMarketValue = true (Original Z-Score)
       │       └─> If extracted → check x4_uses_market_value
       │
       ├─> STEP 3: Extract ESG Score
       │   └─> EsgClient.scoreDocument()
       │       └─> ESG Service → GPT-4o → EsgDocumentScoreResponse
       │
       └─> STEP 4: Calculate Risk
           └─> CompositeRiskService.calculateWithEsgScore(..., usesMarketValue, false)
               └─> EnhancedRiskService.calculate(input, esgTotal, usesMarketValue, false)
                   └─> [Same calculation flow as Scenario 1]
```

---

## Calculation Logic

### 1. Z-Score Calculation

**Formula Selection Logic**:

```java
if (isNonManufacturing) {
    → Z''-Score (6.56×X₁ + 3.26×X₂ + 6.72×X₃ + 1.05×X₄)
} else if (!usesMarketValue) {
    → Z'-Score (0.717×X₁ + 0.847×X₂ + 3.107×X₃ + 0.420×X₄ + 0.998×X₅)
} else {
    → Original Z-Score (1.2×X₁ + 1.4×X₂ + 3.3×X₃ + 0.6×X₄ + 1.0×X₅)
}
```

**Determining `usesMarketValue`**:

1. **If X4 provided manually**:
   - Always assume Market Value → `usesMarketValue = true`
   - Use Original Z-Score formula

2. **If X4 extracted from document**:
   - Check `extraction_details.x4_uses_market_value`
   - If `true` → Original Z-Score
   - If `false` → Z'-Score

3. **Default**:
   - `usesMarketValue = true` (Original Z-Score)

### 2. Extended Financial Analysis

**Process**:

1. Check if additional ratios are provided:
   - Current Ratio
   - Debt-to-Equity
   - Return on Equity
   - Quick Ratio
   - EBITDA Margin

2. Calculate extended score:
   ```java
   extendedScore = average of normalized ratios [0, 1]
   ```

3. Calculate multiplier:
   ```java
   financialMultiplier = 0.7 + (extendedScore × 0.3)  // Range: [0.7, 1.0]
   ```

4. Create adjusted Z (for PD only):
   ```java
   adjustedZ = zScore × financialMultiplier
   ```

5. Calculate adjusted PD:
   ```java
   pAdjusted = logisticCalibration(adjustedZ)
   ```

**Important**: 
- `adjustedZ` is **NOT** saved to `RiskResult`
- Only `zScore` (original) is saved and displayed
- Extended Financial Analysis affects PD, not Z-Score display

### 3. Probability of Default (PD) Calculation

**Logistic Calibration**:

```java
PD = 1 / (1 + exp(-(a + b × Z)))
```

Where:
- `a` = intercept parameter (from config)
- `b` = slope parameter (from config)
- `Z` = Z-Score (original or adjusted)

**PD Values**:
- `pBaseline`: PD from original Z-Score
- `pAdjusted`: PD from adjusted Z-Score (if extended financial analysis)
- `pEnhanced`: Final PD after ESG adjustment

### 4. ESG Adjustment

**Formula**:

```java
esg = clamp(esgScore, 0, 100) / 100  // Normalize to [0, 1]
raw = 0.5 - esg  // ESG > 50% reduces risk, ESG < 50% increases risk
clipped = clamp(raw, -cMax, cMax)  // Limit adjustment
adjustment = k × clipped  // Apply influence factor
pEnhanced = pAdjusted × (1.0 + adjustment)  // Apply adjustment
```

Where:
- `k` = ESG influence factor (from config)
- `cMax` = Maximum adjustment percentage (from config)

**Effect**:
- ESG > 50% → Negative adjustment → Risk reduced
- ESG < 50% → Positive adjustment → Risk increased
- ESG = 50% → No adjustment

---

## Data Models

### `RiskInput.java`

**Fields**:
- `x1, x2, x3, x4, x5` (double) - Altman Z-Score components
- `esgText` (String) - Optional ESG text
- `companyName` (String) - Optional company name
- `currentRatio, debtToEquity, returnOnEquity, quickRatio, ebitdaMargin` (Double) - Additional ratios

### `RiskResult.java`

**Fields**:
- `zScore` (double) - **ALWAYS original Z-Score** (never adjusted)
- `riskZone` (String) - Risk zone classification
- `esgScore` (double) - ESG score (0-100)
- `compositeScore` (double) - Final risk score (PD)
- `pBaseline` (Double) - PD from original Z-Score
- `pAdjusted` (Double) - PD after extended financial analysis
- `pEnhanced` (Double) - Final PD after ESG adjustment
- `zScoreFormulaVersion` (String) - Which formula was used

### `Company.java`

**MongoDB Document**: `companies`

**Fields**:
- `id` (String) - MongoDB ObjectId
- `name` (String) - Company name
- `industry` (String) - Industry sector
- `country` (String) - Country
- `assessmentIds` (List<String>) - Linked assessment IDs
- `createdAt, updatedAt` (LocalDateTime) - Timestamps

### `Assessment.java`

**MongoDB Document**: `assessments`

**Fields**:
- `id` (String) - MongoDB ObjectId
- `companyId` (String) - Reference to Company
- `companyName` (String) - Company name (denormalized)
- `input` (RiskInput) - Input data used
- `result` (RiskResult) - Calculation results
- `metadata` (AssessmentResponseMetadata) - Document processing metadata
- `createdAt` (LocalDateTime) - Timestamp

---

## External Integrations

### ESG Service (Python FastAPI)

**Base URL**: `http://localhost:8000` (configurable)

**Endpoints Used**:

1. **`POST /financial/extract`**:
   - Extracts financial ratios from documents
   - Uses GPT-4o for extraction
   - Returns `FinancialExtractionResponse` with:
     - X1-X5 ratios
     - Additional ratios
     - Confidence score
     - Extraction details

2. **`POST /esg/score-document`**:
   - Scores ESG from document
   - Uses GPT-4o for enhanced analysis
   - Returns `EsgDocumentScoreResponse` with ESG scores

3. **`POST /esg/score`**:
   - Scores ESG from text
   - Returns `EsgScoreResponse` with ESG scores

**Communication**:
- Uses Spring WebFlux `WebClient` for non-blocking requests
- Timeout: 60 seconds
- Error handling with fallbacks

### MongoDB

**Connection**: `mongodb://localhost:27017/risk-scoring`

**Collections**:
- `companies` - Company profiles
- `assessments` - Risk assessments

**Operations**:
- Create, Read, Update, Delete via Spring Data MongoDB repositories
- Automatic ID generation
- Timestamp management

---

## API Endpoints

### Risk Calculation

#### `POST /api/risk/calculate`

**Request Body**: `RiskInput` (JSON)
```json
{
  "x1": 0.15,
  "x2": 0.20,
  "x3": 0.10,
  "x4": 1.50,
  "x5": 1.20,
  "esgText": "Optional ESG text",
  "companyName": "Optional company name"
}
```

**Response**: `RiskResult` (JSON)
```json
{
  "zScore": 2.06,
  "riskZone": "Safe Zone",
  "esgScore": 75.5,
  "compositeScore": 0.15,
  "pBaseline": 0.12,
  "pAdjusted": 0.13,
  "pEnhanced": 0.15,
  "zScoreFormulaVersion": "Z-Score (Original, 1968)"
}
```

#### `POST /api/risk/calculate-with-document`

**Request**: `multipart/form-data`
- `x1, x2, x3, x4, x5` (Double, optional) - Financial ratios
- `esgDocument` (File, optional) - Annual Report PDF/DOCX/TXT
- `esgText` (String, optional) - ESG text
- `companyName` (String, optional) - Company name
- `useOpenai` (boolean, default: true) - Enable GPT-4o
- `useExtractedFinancial` (boolean, default: false) - Use extracted financial data

**Response**: `AssessmentResponse` (JSON)
```json
{
  "result": { ... },
  "documentStats": { ... },
  "documentSections": { ... },
  "financialExtraction": { ... }
}
```

### Company Management

#### `GET /api/companies`
- List all companies

#### `POST /api/companies`
- Create new company

#### `PUT /api/companies/{id}`
- Update company

#### `DELETE /api/companies/{id}`
- Delete company and all assessments

#### `GET /api/companies/{id}/assessments`
- Get all assessments for a company

#### `GET /api/companies/assessments/{id}`
- Get assessment by ID

#### `GET /api/companies/assessments/recent`
- Get recent assessments

---

## Error Handling

### Validation Errors

- **File too large**: Returns 400 with error message
- **Invalid file type**: Returns 400 with error message
- **Missing required data**: Returns 400 with error message

### Service Errors

- **ESG Service unavailable**: Logs error, uses default ESG score
- **MongoDB connection error**: Logs error, continues without persistence
- **OpenAI API error**: Falls back to lexicon-based ESG scoring

### Exception Handling

All exceptions are caught and returned as appropriate HTTP status codes:
- `400 Bad Request` - Client errors
- `500 Internal Server Error` - Server errors
- Error messages included in response body

---

## Configuration

### `application.properties`

**Server Configuration**:
```properties
server.port=8080
```

**CORS Configuration**:
```properties
cors.allowed-origins=http://localhost:3000
```

**ESG Service Configuration**:
```properties
esg.service.url=http://localhost:8000
```

**MongoDB Configuration**:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/risk-scoring
spring.data.mongodb.database=risk-scoring
```

**Risk Calculation Parameters**:
```properties
risk.enhanced.logistic.a=-2.5
risk.enhanced.logistic.b=1.2
risk.enhanced.esg.influence=0.3
risk.enhanced.esg.max-adjustment=0.25
```

---

## Key Design Decisions

### 1. Z-Score Never Changes for Display

**Decision**: Extended Financial Analysis affects PD only, not Z-Score

**Rationale**:
- Z-Score is a diagnostic indicator, not a probability
- Users expect Z-Score to remain constant
- Extended Financial Analysis refines PD, not Z-Score itself

**Implementation**:
- `adjustedZ` calculated but not saved
- Only original `zScore` saved to `RiskResult`
- Frontend always displays original Z-Score

### 2. Automatic Formula Selection

**Decision**: System automatically selects Z-Score formula version

**Rationale**:
- Users shouldn't need to know which formula to use
- System can determine from data type (Market Value vs Book Value)

**Implementation**:
- Checks if X4 was provided manually → assumes Market Value
- Checks extraction details if X4 from document
- Selects appropriate formula automatically

### 3. Optional Financial Data Extraction

**Decision**: Users can choose whether to use extracted financial data

**Rationale**:
- Users may want to use manual inputs even if extraction available
- Provides control over data source

**Implementation**:
- `useExtractedFinancial` flag (default: false)
- If `false` → always use manual inputs
- If `true` → override manual inputs with extracted data

### 4. MongoDB Persistence

**Decision**: Store company profiles and assessments in MongoDB

**Rationale**:
- Enables historical tracking
- Supports company profile management
- Allows assessment comparison

**Implementation**:
- Spring Data MongoDB repositories
- Automatic ID generation
- Timestamp management

---

## Summary

The backend is a well-structured Spring Boot application that:

1. **Orchestrates** multiple services for risk calculation
2. **Integrates** with external services (ESG Service, OpenAI)
3. **Calculates** financial risk using Altman Z-Score
4. **Adjusts** risk based on ESG factors
5. **Persists** results in MongoDB
6. **Provides** RESTful API for frontend

Key principles:
- **Separation of Concerns**: Each service has a single responsibility
- **Non-blocking I/O**: Uses WebClient for external calls
- **Flexible Formula Selection**: Automatically chooses appropriate Z-Score formula
- **Data Integrity**: Z-Score remains constant, only PD is adjusted
- **User Control**: Users can choose data sources and extraction behavior

