from fastapi import FastAPI, HTTPException
from .schemas import EsgScoreRequest, EsgScoreResponse
from .nlp.scoring import score_esg

app = FastAPI(
    title="ESG Scoring Service",
    description="NLP-based ESG scoring microservice using lexicon approach",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"service": "ESG Scoring Service", "version": "1.0.0", "method": "lexicon-v1"}


@app.post("/esg/score", response_model=EsgScoreResponse)
def score_esg_endpoint(request: EsgScoreRequest):
    try:
        e, s, g, esg_total, risk_flags, top_terms = score_esg(request.text)
        
        return EsgScoreResponse(
            e=e,
            s=s,
            g=g,
            esg_total=esg_total,
            risk_flags=risk_flags,
            top_terms=top_terms,
            method_version="lexicon-v1"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")


@app.get("/health")
def health():
    return {"status": "healthy"}

