# Risk Scoring Application

Risk assessment system combining Altman Z-Score financial analysis with ESG factors using NLP. Provides baseline and enhanced risk scoring through logistic calibration and ESG integration.

## 🚀 How to Run

**Prerequisites**: Java 17+, Python 3.8+, pip

### Step 1: Start Python ESG Service

```bash
cd esg-service
pip install -r requirements.txt
uvicorn esg_service.main:app --port 8000
```

Service runs at: http://localhost:8000

### Step 2: Start Java Application

**Windows:**
```bash
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw spring-boot:run
```

Application runs at: http://localhost:8080

## 📋 Features

- Altman Z-Score calculation (baseline financial risk)
- ESG text analysis (E, S, G scoring via Python NLP)
- Enhanced risk model (logistic calibration + weighted fusion)
- REST API integration with fallback mechanism

## ⚙️ Configuration

Edit `src/main/resources/application.properties`:

```properties
esg.service.base-url=http://localhost:8000
esg.service.timeout-ms=2000
risk.enhanced.logistic-a=-2.0
risk.enhanced.logistic-b=0.5
risk.enhanced.weight-financial=0.7
risk.enhanced.weight-esg=0.3
```

## 📖 Usage

1. Open http://localhost:8080
2. Enter financial ratios (X1-X5)
3. Enter ESG text (optional)
4. Click "Calculate Risk Score"
5. View results: Z-Score, ESG scores, baseline vs enhanced probabilities

## 🔌 Test Python Service

```bash
curl -X POST "http://localhost:8000/esg/score" \
  -H "Content-Type: application/json" \
  -d '{"text": "sustainability renewable energy governance"}'
```

## 🐛 Troubleshooting

- **ESG Total shows 0.000**: Check `@JsonProperty` annotations in `EsgScoreResponse.java`
- **Method Version shows "N/A"**: Verify `@JsonProperty("method_version")` annotation
- **Connection refused**: Ensure Python service is running on port 8000
- **Compilation errors**: Run `.\mvnw.cmd clean compile` to check

---

**Version**: 1.0.0
