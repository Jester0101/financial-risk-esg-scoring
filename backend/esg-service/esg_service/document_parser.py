import re
import io
from typing import Dict, Optional
from PyPDF2 import PdfReader
from docx import Document


def parse_pdf(file_content: bytes, use_ocr: bool = True) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        text = ""
        
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            
            if page_text.strip():
                text += page_text + "\n"
            elif use_ocr:
                try:
                    ocr_text = _extract_text_with_ocr(file_content, page_num)
                    if ocr_text:
                        text += ocr_text + "\n"
                except:
                    pass
        
        if not text.strip():
            try:
                import pdfplumber
                pdf_file.seek(0)
                with pdfplumber.open(pdf_file) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            except:
                pass
        
        if not text.strip() and use_ocr:
            text = _extract_text_with_ocr_full(file_content)
        
        return text if text.strip() else ""
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")


def _extract_text_with_ocr(file_content: bytes, page_num: int) -> str:
    try:
        from pdf2image import convert_from_bytes
        import pytesseract
        
        images = convert_from_bytes(file_content, first_page=page_num + 1, last_page=page_num + 1, dpi=300)
        if images:
            return pytesseract.image_to_string(images[0], lang='eng')
        return ""
    except ImportError:
        return ""
    except Exception:
        return ""


def _extract_text_with_ocr_full(file_content: bytes) -> str:
    try:
        from pdf2image import convert_from_bytes
        import pytesseract
        
        images = convert_from_bytes(file_content, dpi=300)
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img, lang='eng') + "\n"
        return text
    except ImportError:
        return ""
    except Exception:
        return ""


def parse_docx(file_content: bytes) -> str:
    try:
        import io
        docx_file = io.BytesIO(file_content)
        doc = Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {str(e)}")


def parse_txt(file_content: bytes) -> str:
    try:
        return file_content.decode('utf-8')
    except UnicodeDecodeError:
        return file_content.decode('latin-1')


def parse_document(file_content: bytes, filename: str, use_ocr: bool = True) -> str:
    max_size_mb = 100
    size_mb = len(file_content) / (1024 * 1024)
    
    if size_mb > max_size_mb:
        raise ValueError(f"File too large: {size_mb:.1f}MB. Maximum size: {max_size_mb}MB")
    
    if filename.lower().endswith('.pdf'):
        return parse_pdf(file_content, use_ocr=use_ocr)
    elif filename.lower().endswith(('.docx', '.doc')):
        return parse_docx(file_content)
    elif filename.lower().endswith('.txt'):
        return parse_txt(file_content)
    else:
        raise ValueError(f"Unsupported file format: {filename}")


def extract_sections(text: str) -> Dict[str, str]:
    text_lower = text.lower()
    
    sections = {
        'environmental': '',
        'social': '',
        'governance': '',
        'general': ''
    }
    
    env_keywords = ['environmental', 'environment', 'sustainability', 'climate', 'carbon', 'emissions', 'renewable', 'green']
    social_keywords = ['social', 'employee', 'workforce', 'community', 'diversity', 'inclusion', 'human rights', 'labor']
    gov_keywords = ['governance', 'board', 'management', 'ethics', 'compliance', 'transparency', 'accountability', 'risk management']
    
    paragraphs = text.split('\n\n')
    
    for para in paragraphs:
        para_lower = para.lower()
        
        env_score = sum(1 for kw in env_keywords if kw in para_lower)
        social_score = sum(1 for kw in social_keywords if kw in para_lower)
        gov_score = sum(1 for kw in gov_keywords if kw in para_lower)
        
        if env_score > 0 and env_score >= social_score and env_score >= gov_score:
            sections['environmental'] += para + "\n\n"
        elif social_score > 0 and social_score >= gov_score:
            sections['social'] += para + "\n\n"
        elif gov_score > 0:
            sections['governance'] += para + "\n\n"
        else:
            sections['general'] += para + "\n\n"
    
    if not sections['environmental'] and not sections['social'] and not sections['governance']:
        sections['general'] = text
    
    return sections

