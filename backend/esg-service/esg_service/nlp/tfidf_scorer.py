from typing import Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


ESG_REFERENCE_TEXTS = {
    "environmental": [
        "sustainability renewable energy carbon neutral climate change environmental protection clean energy emissions reduction biodiversity conservation",
        "green technology renewable resources solar wind hydroelectric clean technology environmental impact carbon footprint reduction",
        "sustainable practices environmental stewardship conservation natural resources pollution prevention waste reduction recycling circular economy",
    ],
    "social": [
        "employee wellbeing diversity inclusion social responsibility community engagement human rights workplace safety employee development training",
        "social impact community programs philanthropy employee satisfaction work-life balance equal opportunity accessibility stakeholder engagement",
        "labor practices employee rights workplace diversity social equity community investment corporate social responsibility social justice",
    ],
    "governance": [
        "governance transparency accountability board independence ethics compliance regulatory oversight risk management internal controls audit",
        "corporate governance ethical leadership stakeholder engagement board diversity executive compensation transparency reporting compliance management",
        "governance framework risk management compliance ethics board oversight accountability transparency stakeholder interests corporate responsibility",
    ],
}


def compute_tfidf_scores(text: str) -> Tuple[float, float, float]:
    if not text or not text.strip():
        return 0.5, 0.5, 0.5

    try:
        vectorizer = TfidfVectorizer(
            max_features=2000,
            stop_words="english",
            ngram_range=(1, 2),
        )

        categories = ["environmental", "social", "governance"]
        reference_texts = []
        for c in categories:
            reference_texts.extend(ESG_REFERENCE_TEXTS[c])

        ref_matrix = vectorizer.fit_transform(reference_texts)
        text_vec = vectorizer.transform([text])

        scores = {}
        for i, c in enumerate(categories):
            start = i * 3
            end = start + 3
            sims = cosine_similarity(text_vec, ref_matrix[start:end])[0]
            scores[c] = float(np.mean(sims)) if sims.size else 0.0

        e_score = _normalize_tfidf_score(scores.get("environmental", 0.0))
        s_score = _normalize_tfidf_score(scores.get("social", 0.0))
        g_score = _normalize_tfidf_score(scores.get("governance", 0.0))

        return e_score, s_score, g_score

    except Exception:
        return 0.5, 0.5, 0.5


def _normalize_tfidf_score(raw_score: float) -> float:
    raw = max(0.0, float(raw_score))

    low = 0.02
    high = 0.20

    if raw <= low:
        return 0.5
    if raw >= high:
        return 1.0

    t = (raw - low) / (high - low)
    return 0.5 + 0.5 * t
