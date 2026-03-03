from typing import Tuple, Optional
import os
import time
import re
from openai import OpenAI, RateLimitError, APIError, APITimeoutError


def score_with_openai(
    text: str,
    api_key: Optional[str] = None,
    timeout: int = 30,
    max_retries: int = 3
) -> Tuple[Optional[float], Optional[float], Optional[float]]:

    if not api_key:
        api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return None, None, None

    client = OpenAI(api_key=api_key)

    prompt = f"""You are an expert ESG analyst evaluating a company's Environmental, Social, and Governance performance from their Annual Report or sustainability disclosure.

TASK: Analyze the provided text and score each ESG dimension from 0.0 to 1.0.

CRITICAL RULES:
1. Only penalize REALIZED incidents: fines paid, sanctions received, lawsuits settled, violations confirmed
2. DO NOT penalize: risk disclosure, risk management discussions, compliance monitoring, audit processes
3. Return ONLY three numbers separated by commas: E,S,G (each between 0.0 and 1.0)

TEXT:
{text[:6000]}
"""

    system_msg = (
        "Return ONLY three numbers separated by commas in the format E,S,G. "
        "Each must be between 0.0 and 1.0. No labels, no extra text."
    )

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-5.1",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=50,
                temperature=0.1,
                timeout=timeout,
            )

            result = (response.choices[0].message.content or "").strip()

            nums = re.findall(r"(?<!\d)(?:0(?:\.\d+)?|1(?:\.0+)?)(?!\d)", result)
            if len(nums) >= 3:
                e = float(nums[0])
                s = float(nums[1])
                g = float(nums[2])
                e = max(0.0, min(1.0, e))
                s = max(0.0, min(1.0, s))
                g = max(0.0, min(1.0, g))
                return e, s, g

            if attempt < max_retries - 1:
                time.sleep(1)
                continue

            return None, None, None

        except RateLimitError:
            if attempt < max_retries - 1:
                time.sleep((2 ** attempt) * 2)
                continue
            return None, None, None

        except (APIError, APITimeoutError):
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return None, None, None

        except Exception:
            return None, None, None

    return None, None, None
