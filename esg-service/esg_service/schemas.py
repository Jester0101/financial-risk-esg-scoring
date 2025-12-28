from pydantic import BaseModel


class EsgScoreRequest(BaseModel):
    text: str


class EsgScoreResponse(BaseModel):
    e: float
    s: float
    g: float
    esg_total: float
    risk_flags: list[str]
    top_terms: list[str]
    method_version: str

