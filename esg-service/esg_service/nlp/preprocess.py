import re


def preprocess_text(text: str) -> str:
    if not text:
        return ""
    
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = text.strip()
    
    return text

