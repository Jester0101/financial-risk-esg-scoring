from fastapi import FastAPI, HTTPException, UploadFile, File
from .schemas import (
    EsgScoreRequest, EsgScoreResponse, EsgDocumentScoreResponse,
    FinancialExtractionRequest, FinancialExtractionResponse
)
from .nlp.scoring import score_esg
from .document_parser import parse_document, extract_sections
from .financial_extractor import extract_financial_data
from dotenv import load_dotenv
import os

try:
    load_dotenv(encoding='utf-8')
except:
    try:
        load_dotenv(encoding='utf-8-sig')
    except:
        load_dotenv()

app = FastAPI(
    title="ESG Scoring Service",
    description="NLP-based ESG scoring microservice using lexicon, TF-IDF and OpenAI",
    version="2.0.0"
)


@app.get("/")
def root():
    return {"service": "ESG Scoring Service", "version": "2.0.0", "methods": ["lexicon", "tfidf", "openai"]}


@app.post("/esg/score", response_model=EsgScoreResponse)
def score_esg_endpoint(request: EsgScoreRequest):
    try:
        e, s, g, esg_total, risk_flags, top_terms = score_esg(
            request.text,
            use_openai=request.use_openai or False,
            openai_key=request.openai_key or os.getenv('OPENAI_API_KEY')
        )
        
        method_version = "lexicon-tfidf-openai" if request.use_openai else "lexicon-tfidf"
        
        return EsgScoreResponse(
            e=e,
            s=s,
            g=g,
            esg_total=esg_total,
            risk_flags=risk_flags,
            top_terms=top_terms,
            method_version=method_version
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(e)}")


@app.post("/esg/score-document", response_model=EsgDocumentScoreResponse)
async def score_document_endpoint(
    file: UploadFile = File(...),
    use_openai: bool = False,
    use_ocr: bool = True
):
    try:
        file_content = await file.read()
        filename = file.filename or "document"
        file_size_mb = len(file_content) / (1024 * 1024)
        
        if file_size_mb > 100:
            raise HTTPException(status_code=400, detail=f"File too large: {file_size_mb:.1f}MB. Maximum: 100MB")
        
        text = parse_document(file_content, filename, use_ocr=use_ocr)
        text_length = len(text)
        text_words = len(text.split())
        
        try:
            import io
            from PyPDF2 import PdfReader
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            num_pages = len(reader.pages)
        except:
            num_pages = None
        
        sections = extract_sections(text)
        
        section_scores = {}
        overall_scores = {'e': 0.0, 's': 0.0, 'g': 0.0}
        
        openai_key = os.getenv('OPENAI_API_KEY')
        
        for section_name, section_text in sections.items():
            if section_text.strip():
                e, s, g, _, risk_flags, top_terms = score_esg(
                    section_text,
                    use_openai=use_openai,
                    openai_key=openai_key
                )
                
                section_scores[section_name] = {
                    'e': e,
                    's': s,
                    'g': g,
                    'esg_total': (e + s + g) / 3.0
                }
                
                overall_scores['e'] += e
                overall_scores['s'] += s
                overall_scores['g'] += g
        
        num_sections = len([s for s in sections.values() if s.strip()])
        if num_sections > 0:
            overall_scores['e'] /= num_sections
            overall_scores['s'] /= num_sections
            overall_scores['g'] /= num_sections
        
        e_final, s_final, g_final, _, risk_flags_final, top_terms_final = score_esg(
            text,
            use_openai=use_openai,
            openai_key=openai_key
        )
        
        if num_sections > 0:
            e_final = (e_final * 0.5 + overall_scores['e'] * 0.5)
            s_final = (s_final * 0.5 + overall_scores['s'] * 0.5)
            g_final = (g_final * 0.5 + overall_scores['g'] * 0.5)
        
        esg_total = (e_final + s_final + g_final) / 3.0
        
        method_version = "lexicon-tfidf-openai-document" if use_openai else "lexicon-tfidf-document"
        
        document_stats = {
            "filename": filename,
            "file_size_mb": round(file_size_mb, 2),
            "num_pages": num_pages,
            "text_length": text_length,
            "text_words": text_words,
            "sections_found": len([s for s in sections.values() if s.strip()]),
            "environmental_section_length": len(sections.get('environmental', '')),
            "social_section_length": len(sections.get('social', '')),
            "governance_section_length": len(sections.get('governance', '')),
            "ocr_used": use_ocr and (text_length > 0)
        }
        
        return EsgDocumentScoreResponse(
            e=e_final,
            s=s_final,
            g=g_final,
            esg_total=esg_total,
            risk_flags=risk_flags_final,
            top_terms=top_terms_final,
            method_version=method_version,
            sections=section_scores,
            document_stats=document_stats
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing error: {str(e)}")


@app.post("/financial/extract", response_model=FinancialExtractionResponse)
async def extract_financial_endpoint(
    file: UploadFile = File(None),
    text: str = None,
    use_ocr: bool = True
):
    try:
        openai_key = os.getenv('OPENAI_API_KEY')
        
        if file:
            file_content = await file.read()
            filename = file.filename or "document"
            text = parse_document(file_content, filename, use_ocr=use_ocr)
        elif not text:
            raise HTTPException(status_code=400, detail="Either file or text must be provided")
        
        if not text or len(text.strip()) < 100:
            raise HTTPException(status_code=400, detail="Text too short or empty")
        
        result = extract_financial_data(text, api_key=openai_key)
        
        return FinancialExtractionResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Financial extraction error: {str(e)}")


@app.get("/health")
def health():
    return {"status": "healthy"}

