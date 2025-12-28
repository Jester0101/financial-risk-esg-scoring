# Verification Guide - How to Check Everything is Correct

## Quick Verification Steps

### 1. Check Java Compilation ✅
```bash
.\mvnw.cmd clean compile
```
**Expected:** `BUILD SUCCESS`

### 2. Check Python Syntax ✅
```bash
cd esg-service
python -m py_compile esg_service/main.py
python -m py_compile esg_service/schemas.py
python -m py_compile esg_service/nlp/scoring.py
```
**Expected:** No errors (silent success)

### 3. Test Python Service ✅
```bash
cd esg-service
pip install -r requirements.txt
uvicorn esg_service.main:app --port 8000
```
Then in another terminal:
```bash
curl -X POST "http://localhost:8000/esg/score" -H "Content-Type: application/json" -d "{\"text\": \"sustainability renewable energy\"}"
```
**Expected:** JSON response with e, s, g, esg_total, etc.

### 4. Test Java Application ✅
```bash
.\mvnw.cmd spring-boot:run
```
**Expected:** Application starts on http://localhost:8080

### 5. Test Integration ✅
1. Start Python service (port 8000)
2. Start Java app (port 8080)
3. Open http://localhost:8080
4. Enter test data and click "Calculate"
5. **Expected:** Results show ESG scores from Python service

### 6. Test Fallback ✅
1. Stop Python service
2. Use Java app
3. **Expected:** Still works, shows "fallback" method version

## File Structure Check

### Java Files (should exist):
- ✅ `src/main/java/com/risk/scoring/client/EsgClient.java`
- ✅ `src/main/java/com/risk/scoring/config/EsgServiceConfig.java`
- ✅ `src/main/java/com/risk/scoring/config/RiskEnhancedConfig.java`
- ✅ `src/main/java/com/risk/scoring/dto/EsgScoreRequest.java`
- ✅ `src/main/java/com/risk/scoring/dto/EsgScoreResponse.java`
- ✅ `src/main/java/com/risk/scoring/service/EnhancedRiskService.java`
- ✅ `src/main/java/com/risk/scoring/service/CompositeRiskService.java`
- ✅ `src/main/java/com/risk/scoring/model/RiskResult.java` (with new fields)

### Python Files (should exist):
- ✅ `esg-service/esg_service/main.py`
- ✅ `esg-service/esg_service/schemas.py`
- ✅ `esg-service/esg_service/nlp/preprocess.py`
- ✅ `esg-service/esg_service/nlp/lexicon.py`
- ✅ `esg-service/esg_service/nlp/scoring.py`
- ✅ `esg-service/requirements.txt`

### Configuration:
- ✅ `src/main/resources/application.properties` (with ESG config)
- ✅ `pom.xml` (with webflux dependency)

## Common Issues & Fixes

### Issue: Java compilation error
**Fix:** Check all imports are correct, no missing dependencies

### Issue: Python import errors
**Fix:** Make sure you're in `esg-service` directory when running

### Issue: Connection refused (Java to Python)
**Fix:** Ensure Python service is running on port 8000

### Issue: Fallback not working
**Fix:** Check `EsgClient.java` catch block handles exceptions correctly

