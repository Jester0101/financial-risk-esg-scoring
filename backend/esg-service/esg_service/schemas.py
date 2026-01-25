from pydantic import BaseModel
from typing import Optional, Any


class EsgScoreRequest(BaseModel):
    text: str
    use_openai: Optional[bool] = False
    openai_key: Optional[str] = None


class EsgDocumentScoreResponse(BaseModel):
    e: float
    s: float
    g: float
    esg_total: float
    risk_flags: list[str]
    top_terms: list[str]
    method_version: str
    sections: dict[str, dict[str, float]]
    document_stats: Optional[dict[str, Any]] = None


class EsgScoreResponse(BaseModel):
    e: float
    s: float
    g: float
    esg_total: float
    risk_flags: list[str]
    top_terms: list[str]
    method_version: str


class FinancialExtractionRequest(BaseModel):
    text: str
    openai_key: Optional[str] = None


class FinancialExtractionResponse(BaseModel):
    x1: Optional[float] = None
    x2: Optional[float] = None
    x3: Optional[float] = None
    x4: Optional[float] = None
    x5: Optional[float] = None
    current_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    return_on_equity: Optional[float] = None
    quick_ratio: Optional[float] = None
    ebitda_margin: Optional[float] = None
    confidence: float
    source: str
    extraction_details: dict[str, Any]

