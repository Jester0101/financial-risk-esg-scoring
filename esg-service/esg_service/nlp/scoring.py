from typing import List, Tuple
from .preprocess import preprocess_text
from .lexicon import (
    ENVIRONMENTAL_POSITIVE, ENVIRONMENTAL_NEGATIVE,
    SOCIAL_POSITIVE, SOCIAL_NEGATIVE,
    GOVERNANCE_POSITIVE, GOVERNANCE_NEGATIVE,
    RISK_FLAGS
)


def score_esg(text: str) -> Tuple[float, float, float, float, List[str], List[str]]:
    if not text or not text.strip():
        return 0.5, 0.5, 0.5, 0.5, [], []
    
    processed = preprocess_text(text)
    words = set(processed.split())
    
    e_pos = sum(1 for term in ENVIRONMENTAL_POSITIVE if term in processed)
    e_neg = sum(1 for term in ENVIRONMENTAL_NEGATIVE if term in processed)
    e_score = _normalize_score(e_pos, e_neg)
    
    s_pos = sum(1 for term in SOCIAL_POSITIVE if term in processed)
    s_neg = sum(1 for term in SOCIAL_NEGATIVE if term in processed)
    s_score = _normalize_score(s_pos, s_neg)
    
    g_pos = sum(1 for term in GOVERNANCE_POSITIVE if term in processed)
    g_neg = sum(1 for term in GOVERNANCE_NEGATIVE if term in processed)
    g_score = _normalize_score(g_pos, g_neg)
    
    esg_total = (e_score + s_score + g_score) / 3.0
    
    risk_flags = [term for term in RISK_FLAGS if term in processed]
    
    all_terms = []
    all_terms.extend([term for term in ENVIRONMENTAL_POSITIVE if term in processed][:3])
    all_terms.extend([term for term in SOCIAL_POSITIVE if term in processed][:3])
    all_terms.extend([term for term in GOVERNANCE_POSITIVE if term in processed][:3])
    top_terms = all_terms[:10]
    
    return e_score, s_score, g_score, esg_total, risk_flags, top_terms


def _normalize_score(positive_count: int, negative_count: int) -> float:
    base = 0.5
    score = base + (positive_count * 0.08) - (negative_count * 0.12)
    return max(0.0, min(1.0, score))

