# ESG Scoring Service

Python microservice for ESG (Environmental, Social, Governance) scoring using lexicon-based NLP.

## Features

- Lexicon-based scoring (no LLM required)
- Separate E, S, G scores
- Risk flag detection
- Top terms extraction
- Method versioning (lexicon-v1)

## Installation

```bash
cd esg-service
pip install -r requirements.txt
```

## Running the Service

```bash
uvicorn esg_service.main:app --reload --port 8000
```

The service will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## API Endpoint

### POST /esg/score

**Request:**
```json
{
  "text": "Our company is committed to sustainability and renewable energy. We have strong governance practices and focus on employee wellbeing."
}
```

**Response:**
```json
{
  "e": 0.66,
  "s": 0.58,
  "g": 0.66,
  "esg_total": 0.633,
  "risk_flags": [],
  "top_terms": ["sustainability", "renewable", "governance", "employee wellbeing"],
  "method_version": "lexicon-v1"
}
```

## Testing

### Using curl:

```bash
curl -X POST "http://localhost:8000/esg/score" \
  -H "Content-Type: application/json" \
  -d '{"text": "The company faces environmental violations and governance issues."}'
```

### Using Python:

```python
import requests

response = requests.post(
    "http://localhost:8000/esg/score",
    json={"text": "We focus on sustainability and renewable energy."}
)
print(response.json())
```

## Method Details

- **Preprocessing**: Lowercasing, whitespace cleanup, punctuation removal
- **Scoring**: Keyword matching with positive/negative term counting
- **Normalization**: Base score 0.5, adjusted by term counts, clamped to [0, 1]
- **Version**: lexicon-v1 (reproducible, no external models)

