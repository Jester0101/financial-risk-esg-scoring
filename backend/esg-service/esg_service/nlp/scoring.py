from typing import List, Tuple, Optional
import re
from .preprocess import preprocess_text
from .lexicon import (
    ENVIRONMENTAL_POSITIVE, ENVIRONMENTAL_NEGATIVE,
    SOCIAL_POSITIVE, SOCIAL_NEGATIVE,
    GOVERNANCE_POSITIVE,
    GOVERNANCE_NEGATIVE_INCIDENTS, GOVERNANCE_NEGATIVE_CONTEXTUAL,
    RISK_FLAGS
)
from .tfidf_scorer import compute_tfidf_scores
from .openai_scorer import score_with_openai


def score_esg(
    text: str,
    use_openai: bool = False,
    openai_key: Optional[str] = None
) -> Tuple[float, float, float, float, List[str], List[str]]:

    if not text or not text.strip():
        return 0.5, 0.5, 0.5, 0.5, [], []

    processed = preprocess_text(text)

    e_lexicon, s_lexicon, g_lexicon = _score_lexicon(processed)
    e_tfidf, s_tfidf, g_tfidf = compute_tfidf_scores(text)

    e_openai = s_openai = g_openai = None
    if use_openai:
        e_openai, s_openai, g_openai = score_with_openai(text, openai_key)

    if None not in (e_openai, s_openai, g_openai):
        e_score = e_lexicon * 0.3 + e_tfidf * 0.3 + float(e_openai) * 0.4
        s_score = s_lexicon * 0.3 + s_tfidf * 0.3 + float(s_openai) * 0.4
        g_score = g_lexicon * 0.3 + g_tfidf * 0.3 + float(g_openai) * 0.4
    else:
        e_score = e_lexicon * 0.5 + e_tfidf * 0.5
        s_score = s_lexicon * 0.5 + s_tfidf * 0.5
        g_score = g_lexicon * 0.5 + g_tfidf * 0.5

    e_score = _clamp01(e_score)
    s_score = _clamp01(s_score)
    g_score = _clamp01(g_score)

    esg_total = (e_score + s_score + g_score) / 3.0

    risk_flags = _extract_flags(processed)

    top_terms = _extract_top_terms(processed)

    return e_score, s_score, g_score, esg_total, risk_flags, top_terms


def _score_lexicon(processed: str) -> Tuple[float, float, float]:
    e_pos = _count_terms(processed, ENVIRONMENTAL_POSITIVE)
    e_neg = _count_terms(processed, ENVIRONMENTAL_NEGATIVE)
    e_score = _normalize_score(e_pos, e_neg)

    s_pos = _count_terms(processed, SOCIAL_POSITIVE)
    s_neg = _count_terms(processed, SOCIAL_NEGATIVE)
    s_score = _normalize_score(s_pos, s_neg)

    g_pos = _count_terms(processed, GOVERNANCE_POSITIVE)
    g_neg_incidents = _count_terms(processed, GOVERNANCE_NEGATIVE_INCIDENTS)
    g_neg_contextual = _count_contextual_negative_terms(processed)

    g_neg = g_neg_incidents + g_neg_contextual
    g_score = _normalize_score(g_pos, g_neg)

    return e_score, s_score, g_score


def _count_contextual_negative_terms(processed: str) -> int:
    outcome_patterns = [
        r"\breceived\b",
        r"\bpaid\b",
        r"\bfaced\b",
        r"\bimposed\b",
        r"\bsettled\b",
        r"\bresolved\b",
        r"\boccurred\b",
        r"\bhappened\b",
        r"\bcharged\b",
        r"\bsanction(?:ed)?\b",
        r"\bfine(?:d|s)?\b",
        r"\bpenalt(?:y|ies)\b",
        r"\bviolat(?:ed|ion|ions)\b",
        r"\binvestigation\b.*\bconcluded\b",
        r"\blawsuit\b.*\bsettled\b",
        r"\b(complaint|lawsuit)\b.*\bfiled\b",
    ]

    outcome_re = re.compile("|".join(outcome_patterns), flags=re.IGNORECASE)
    count = 0

    for term in GOVERNANCE_NEGATIVE_CONTEXTUAL:
        term_re = re.compile(rf"\b{re.escape(term)}\b", flags=re.IGNORECASE)
        for m in term_re.finditer(processed):
            start = max(0, m.start() - 300)
            end = min(len(processed), m.end() + 300)
            context = processed[start:end]
            if outcome_re.search(context):
                count += 1

    return count


def _normalize_score(positive_count: int, negative_count: int) -> float:
    return _clamp01(0.5 + positive_count * 0.06 - negative_count * 0.08)


def _count_terms(processed: str, terms: List[str]) -> int:
    total = 0
    for t in terms:
        t_re = re.compile(rf"\b{re.escape(t)}\b", flags=re.IGNORECASE)
        total += len(t_re.findall(processed))
    return total


def _extract_flags(processed: str) -> List[str]:
    flags = []
    for t in RISK_FLAGS:
        t_re = re.compile(rf"\b{re.escape(t)}\b", flags=re.IGNORECASE)
        if t_re.search(processed):
            flags.append(t)
    return flags


def _extract_top_terms(processed: str) -> List[str]:
    top = []
    for t in ENVIRONMENTAL_POSITIVE:
        if len(top) >= 3:
            break
        if re.search(rf"\b{re.escape(t)}\b", processed, flags=re.IGNORECASE):
            top.append(t)

    for t in SOCIAL_POSITIVE:
        if len(top) >= 6:
            break
        if re.search(rf"\b{re.escape(t)}\b", processed, flags=re.IGNORECASE):
            top.append(t)

    for t in GOVERNANCE_POSITIVE:
        if len(top) >= 9:
            break
        if re.search(rf"\b{re.escape(t)}\b", processed, flags=re.IGNORECASE):
            top.append(t)

    return top[:10]


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, float(x)))
