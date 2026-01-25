from typing import Dict, Any, Optional
import os
from openai import OpenAI, RateLimitError, APIError, APITimeoutError
import time


def generate_risk_summary(
    z_score: float,
    risk_zone: str,
    p_baseline: float,
    p_adjusted: Optional[float],
    p_enhanced: float,
    esg_score: Optional[float],
    esg_e: Optional[float] = None,
    esg_s: Optional[float] = None,
    esg_g: Optional[float] = None,
    api_key: Optional[str] = None,
    timeout: int = 60,
    max_retries: int = 3
) -> str:
    if not api_key:
        api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        return _generate_fallback_summary(z_score, risk_zone, p_enhanced, esg_score)
    
    client = OpenAI(api_key=api_key)
    
    esg_context = ""
    if esg_score is not None:
        esg_context = f"""
ESG Analysis:
- Overall ESG Score: {esg_score * 100:.0f}% ({'Strong' if esg_score > 0.5 else 'Weak' if esg_score < 0.5 else 'Neutral'})
"""
        if esg_e is not None and esg_s is not None and esg_g is not None:
            esg_context += f"- Environmental (E): {esg_e * 100:.0f}%\n"
            esg_context += f"- Social (S): {esg_s * 100:.0f}%\n"
            esg_context += f"- Governance (G): {esg_g * 100:.0f}%\n"
    
    financial_context = f"""
Financial Risk Assessment:
- Altman Z-Score: {z_score:.2f} (Diagnostic indicator, not probability)
- Risk Zone: {risk_zone}
- Baseline Probability of Default: {p_baseline * 100:.1f}%
"""
    if p_adjusted is not None and p_adjusted != p_baseline:
        financial_context += f"- Adjusted PD (after extended financial analysis): {p_adjusted * 100:.1f}%\n"
    
    financial_context += f"- Final Probability of Default (with ESG): {p_enhanced * 100:.1f}%\n"
    
    prompt = f"""You are a senior financial risk analyst writing a comprehensive assessment summary.

Based on the following risk assessment data, write a clear, professional, analyst-level summary (2-3 paragraphs) that:

1. **Financial Health Assessment**: Interpret the Altman Z-Score and risk zone. Explain what the probability of default means in practical terms. Be specific about the level of financial distress risk.

2. **ESG Impact Analysis**: If ESG data is available, explain how ESG factors influenced the final risk assessment. Note whether ESG improved or worsened the risk profile and by how much.

3. **Overall Risk Conclusion**: Provide a clear, actionable conclusion about the company's overall risk profile. Use professional but accessible language suitable for CFOs and analysts.

**Guidelines:**
- Be specific with numbers and percentages
- Avoid jargon; explain technical terms when needed
- Be direct about risk levels (high/moderate/low)
- Mention any notable factors (e.g., "ESG factors reduced risk by X%")
- Keep it concise but comprehensive (2-3 paragraphs, ~200-300 words)

**Assessment Data:**
{financial_context}
{esg_context}

**Write the summary now:**"""

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a senior financial risk analyst. Write clear, professional, analyst-level summaries. Be specific, direct, and actionable."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
            
        except RateLimitError:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) * 2
                time.sleep(wait_time)
                continue
            return _generate_fallback_summary(z_score, risk_zone, p_enhanced, esg_score)
        
        except (APIError, APITimeoutError) as e:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            return _generate_fallback_summary(z_score, risk_zone, p_enhanced, esg_score)
        
        except Exception:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return _generate_fallback_summary(z_score, risk_zone, p_enhanced, esg_score)
    
    return _generate_fallback_summary(z_score, risk_zone, p_enhanced, esg_score)


def _generate_fallback_summary(
    z_score: float,
    risk_zone: str,
    p_enhanced: float,
    esg_score: Optional[float]
) -> str:
    risk_level = "high" if p_enhanced > 0.3 else "moderate" if p_enhanced > 0.15 else "low"
    
    summary = f"""Financial Risk Assessment Summary

The company's Altman Z-Score of {z_score:.2f} places it in the {risk_zone}, indicating {'high structural risk' if 'Distress' in risk_zone else 'moderate risk' if 'Grey' in risk_zone else 'low structural risk'}. The estimated probability of default is {p_enhanced * 100:.1f}%, which represents a {risk_level} risk level."""
    
    if esg_score is not None:
        esg_impact = "reduced" if esg_score > 0.5 else "increased" if esg_score < 0.5 else "maintained"
        summary += f" ESG factors ({esg_score * 100:.0f}% overall score) have {esg_impact} the risk assessment."
    
    summary += " This assessment combines financial metrics with ESG considerations to provide a comprehensive view of the company's risk profile."
    
    return summary

