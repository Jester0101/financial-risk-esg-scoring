from typing import Dict, Optional, Any
import os
import json
import re
from openai import OpenAI, RateLimitError, APIError, APITimeoutError
import time


def extract_financial_data(
    text: str,
    api_key: Optional[str] = None,
    timeout: int = 60,
    max_retries: int = 3
) -> Dict[str, Any]:
    if not api_key:
        api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        return _empty_result("No API key provided")
    
    financial_sections = _extract_financial_sections(text)
    
    if not financial_sections:
        return _empty_result("No financial statements found")
    
    print(f"[Financial Extractor] Extracted {len(financial_sections)} characters of financial sections")
    
    client = OpenAI(api_key=api_key)
    
    prompt = f"""You are an expert financial analyst specializing in extracting precise financial metrics from Annual Reports for credit risk assessment.

**TASK:** Extract financial ratios from CONSOLIDATED financial statements for Altman Z-Score calculation and extended financial analysis.

**CRITICAL REQUIREMENTS:**
1. Use ONLY CONSOLIDATED financial statements (ignore standalone/separate entity statements)
2. All values must be from the SAME reporting period (same fiscal year)
3. Use exact values from financial statements, not estimates or projections
4. If a value cannot be found with high confidence, return null

**ALTMAN Z-SCORE COMPONENTS (Required):**

1. **X1 = Working Capital / Total Assets**
   - Working Capital = Current Assets - Current Liabilities
   - Source: Balance Sheet (Statement of Financial Position)
   - Look for: "Current Assets", "Current Liabilities", "Total Assets"
   - Calculate: (Current Assets - Current Liabilities) / Total Assets

2. **X2 = Retained Earnings / Total Assets**
   - Retained Earnings: From Balance Sheet under Shareholders' Equity section
   - May be labeled: "Retained Earnings", "Retained Deficit", "Accumulated Deficit"
   - Total Assets: From Balance Sheet
   - Can be negative if company has accumulated losses

3. **X3 = EBIT / Total Assets**
   - EBIT: From Income Statement (Statement of Operations/Comprehensive Income)
   - Alternative names: "Operating Income", "Operating Profit", "EBIT", "Earnings Before Interest and Taxes"
   - If EBIT not explicitly stated, calculate: Operating Income or Net Income + Interest Expense + Tax Expense
   - Total Assets: From Balance Sheet (same period)

4. **X4 = Market Value of Equity / Book Value of Total Liabilities**
   
   **IMPORTANT: Understanding Market Value vs Book Value for X4:**
   
   - **Market Value of Equity** (Preferred): Share Price × Shares Outstanding
     * This is the current market capitalization (what investors are willing to pay)
     * Look for: "Market Capitalization", "Market Cap", or calculate from share price and shares outstanding
     * This is the IDEAL value for Altman Z-Score as it reflects investor confidence
   
   - **Book Value of Equity** (Fallback if Market Value unavailable):
     * This is the accounting value from Balance Sheet: Total Assets - Total Liabilities
     * Also called "Shareholders' Equity", "Stockholders' Equity", "Net Assets"
     * Book Value is acceptable for the formula but may differ significantly from Market Value
     * Book Value = Historical cost basis, Market Value = Current market perception
   
   - **Total Liabilities**: From Balance Sheet (always use Book Value)
   
   **CRITICAL:** 
   - If you use Market Value, set x4_uses_market_value = true in extraction_details
   - If you use Book Value (because Market Value not found), set x4_uses_market_value = false in extraction_details
   - Always indicate which one you used so the system can properly assess the calculation

5. **X5 = Sales (Revenue) / Total Assets**
   - Sales/Revenue: From Income Statement
   - Alternative names: "Revenue", "Net Sales", "Total Revenue", "Operating Revenue"
   - Total Assets: From Balance Sheet (same period)

**ADDITIONAL RATIOS (CRITICAL - MUST EXTRACT THESE):**

These ratios are ESSENTIAL for extended financial analysis. You MUST extract them - they are almost always present in annual reports. Follow these detailed instructions:

1. **Current Ratio** = Current Assets / Current Liabilities
   - **WHERE TO LOOK:**
     * Balance Sheet (Statement of Financial Position) - PRIMARY SOURCE
     * Look in "Current Assets" section: "Current Assets", "Total Current Assets", "Current Assets Total"
     * Look in "Current Liabilities" section: "Current Liabilities", "Total Current Liabilities", "Current Liabilities Total"
   - **ALTERNATIVE NAMES:**
     * Current Assets: "Current Assets", "Total Current Assets", "Current Assets Total", "Short-term Assets"
     * Current Liabilities: "Current Liabilities", "Total Current Liabilities", "Current Liabilities Total", "Short-term Liabilities"
   - **CALCULATION:** If both components are found, calculate: Current Assets / Current Liabilities
   - **IF NOT FOUND:** Check Notes to Financial Statements, Management Discussion, or Financial Highlights section
   - **IMPORTANT:** This ratio is almost always calculable from Balance Sheet - rarely missing

2. **Debt-to-Equity** = Total Debt / Total Shareholders' Equity
   - **WHERE TO LOOK:**
     * Balance Sheet - PRIMARY SOURCE
     * Notes to Financial Statements (Note on Debt, Borrowings, or Financing)
     * Management Discussion section
   - **TOTAL DEBT - Look for:**
     * "Total Debt", "Total Borrowings", "Total Debt and Borrowings", "Total Financial Debt"
     * "Total Liabilities" (if equity is clearly separate)
     * Calculate: "Short-term Debt" + "Long-term Debt" + "Current Portion of Long-term Debt"
     * Alternative names: "Borrowings", "Debt", "Financial Liabilities", "Interest-bearing Debt"
   - **SHAREHOLDERS' EQUITY - Look for:**
     * "Total Shareholders' Equity", "Total Equity", "Stockholders' Equity", "Shareholders' Funds"
     * "Total Equity and Liabilities" minus "Total Liabilities"
   - **CALCULATION:** If both components are found, calculate: Total Debt / Total Shareholders' Equity
   - **IF NOT FOUND:** Check Notes to Financial Statements, especially Note on "Debt", "Borrowings", or "Financing"
   - **IMPORTANT:** Even if "Total Debt" is not explicitly stated, calculate it from debt components

3. **Return on Equity (ROE)** = Net Income / Shareholders' Equity
   - **WHERE TO LOOK:**
     * Income Statement (for Net Income) - PRIMARY SOURCE
     * Balance Sheet (for Shareholders' Equity) - PRIMARY SOURCE
     * Management Discussion section (often mentions ROE directly)
     * Financial Highlights or Key Metrics section
   - **NET INCOME - Look for:**
     * "Net Income", "Profit for the Year", "Net Earnings", "Net Profit", "Profit After Tax"
     * "Net Income Attributable to Shareholders", "Net Income Available to Common Shareholders"
     * Alternative names: "Net Result", "Profit/(Loss) for the Period", "Comprehensive Income"
   - **SHAREHOLDERS' EQUITY - Look for:**
     * "Total Shareholders' Equity", "Total Equity", "Stockholders' Equity" (year-end value)
     * "Average Shareholders' Equity" (if mentioned, use it; otherwise use year-end)
   - **CALCULATION:** If both components are found, calculate: Net Income / Shareholders' Equity
   - **IF NOT FOUND:** Check Financial Highlights, Key Performance Indicators, or Management Discussion sections
   - **IMPORTANT:** ROE is often mentioned directly in Management Discussion or Financial Highlights

4. **Quick Ratio** = (Current Assets - Inventory) / Current Liabilities
   - Current Assets: From Balance Sheet
   - Inventory: From Balance Sheet under Current Assets (may be "Inventories", "Stock", "Merchandise")
   - Current Liabilities: From Balance Sheet
   - ALTERNATIVE CALCULATION if Inventory not separately listed:
     Quick Ratio = (Cash + Cash Equivalents + Marketable Securities + Accounts Receivable) / Current Liabilities
   - Look in Current Assets breakdown for: "Cash", "Cash and Cash Equivalents", "Marketable Securities", "Trade Receivables", "Accounts Receivable"

5. **EBITDA Margin** = EBITDA / Revenue
   - EBITDA: Look for explicit "EBITDA" in Income Statement
   - If not found, calculate: Operating Income + Depreciation + Amortization
   - Depreciation and Amortization: May be in Income Statement or Cash Flow Statement
   - Check Notes to Financial Statements for depreciation/amortization details
   - Revenue: From Income Statement (same as used for X5)
   - ALTERNATIVE: If EBITDA not available, use Operating Income / Revenue as proxy

**EXTRACTION PRIORITY FOR ADDITIONAL RATIOS:**
- If a component value is missing, try to calculate it from related values
- Check Notes to Financial Statements - they often contain detailed breakdowns
- Look for tables with financial data - ratios may be calculated and presented
- If exact value not found, use closest approximation (e.g., if "Total Debt" not found, sum all debt categories)
- DO NOT return null unless absolutely certain the value cannot be found or calculated

**EXTRACTION STRATEGY:**
1. First, locate the Consolidated Balance Sheet (Statement of Financial Position)
   - Look for section headers: "CONSOLIDATED BALANCE SHEETS", "STATEMENT OF FINANCIAL POSITION", "CONSOLIDATED STATEMENT OF FINANCIAL POSITION"
   - Check table headers and footnotes
2. Then, locate the Consolidated Income Statement (Statement of Operations/Comprehensive Income)
   - Look for: "CONSOLIDATED INCOME STATEMENT", "STATEMENT OF OPERATIONS", "CONSOLIDATED STATEMENT OF OPERATIONS", "STATEMENT OF COMPREHENSIVE INCOME"
3. Check Notes to Financial Statements for additional details
   - Note 1: Summary of Significant Accounting Policies
   - Note 2: Revenue Recognition
   - Note 3: Property, Plant and Equipment
   - Note 4: Debt and Borrowings
4. Verify all numbers are from the same fiscal year (check column headers carefully)
5. Cross-reference related values for consistency
6. For ratios: Calculate directly from extracted values when possible

**IMPORTANT EXTRACTION TIPS:**
- Look for tables with column headers showing years (e.g., "2023", "2022", "2021")
- Use the most recent year's data
- Check for footnotes that might explain adjustments
- If a value is negative, include the minus sign
- For ratios like ROE, if average equity is not available, use year-end equity
- For Quick Ratio, if inventory is not separately listed, try to find it in Current Assets breakdown

**CONFIDENCE SCORING:**
- 0.9-1.0: All values clearly found in consolidated statements, same period, no assumptions needed
- 0.7-0.9: Most values found, minor assumptions made (e.g., using year-end instead of average)
- 0.5-0.7: Some values found, significant assumptions or estimates (e.g., calculated from related values)
- 0.3-0.5: Limited data found, many assumptions, some values may be approximate
- 0.0-0.3: Insufficient data, cannot extract reliably

**REPORT TEXT (Financial Sections Only):**
{financial_sections[:20000]}

**CRITICAL REMINDER - ADDITIONAL RATIOS (Current Ratio, Debt-to-Equity, ROE, Quick Ratio, EBITDA Margin):**

These ratios are ABSOLUTELY ESSENTIAL and MUST be extracted. They are standard financial metrics present in virtually all annual reports.

**EXTRACTION STRATEGY:**
1. **Search these sections in order:**
   - Financial Highlights / Key Metrics (often has pre-calculated ratios)
   - Management Discussion and Analysis (MD&A) - often discusses these ratios
   - Financial Review / Financial Summary
   - Balance Sheet and Income Statement (for components)
   - Notes to Financial Statements (for detailed breakdowns)

2. **If ratio not found directly, calculate from components:**
   - Current Ratio: Current Assets / Current Liabilities (both from Balance Sheet)
   - Debt-to-Equity: (Short-term Debt + Long-term Debt) / Shareholders' Equity
   - ROE: Net Income / Shareholders' Equity (from Income Statement and Balance Sheet)

3. **Alternative names to search for:**
   - Current Ratio: "Current Ratio", "Working Capital Ratio", "Liquidity Ratio"
   - Debt-to-Equity: "Debt-to-Equity", "D/E Ratio", "Gearing Ratio", "Leverage Ratio"
   - ROE: "Return on Equity", "ROE", "Return on Shareholders' Equity", "Equity Return"

4. **DO NOT GIVE UP:**
   - These ratios are standard metrics - they are almost always present
   - If not in main statements, check Notes, MD&A, or Financial Highlights
   - Calculate from components if direct values not found
   - Only return null after exhaustive search of ALL sections

**OUTPUT FORMAT:**
Return a JSON object with this EXACT structure (no additional text, no markdown, pure JSON):
{{
    "x1": <number or null>,
    "x2": <number or null>,
    "x3": <number or null>,
    "x4": <number or null>,
    "x5": <number or null>,
    "current_ratio": <number or null>,
    "debt_to_equity": <number or null>,
    "return_on_equity": <number or null>,
    "quick_ratio": <number or null>,
    "ebitda_margin": <number or null>,
    "confidence": <number between 0.0 and 1.0>,
    "extraction_details": {{
        "balance_sheet_found": <true/false>,
        "income_statement_found": <true/false>,
        "notes_found": <true/false>,
        "fiscal_year": "<year if found>",
        "sections_used": ["list of section names found"],
        "page_references": ["page numbers or section references"],
        "calculation_notes": ["any important notes about calculations or assumptions"],
        "x4_uses_market_value": <true/false - true if Market Value of Equity was used, false if Book Value was used>
    }}
}}

**IMPORTANT:** Return ONLY valid JSON. No explanations, no markdown formatting, no additional text before or after the JSON."""

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",  # Using gpt-4o (gpt-4.1 not available, gpt-4o is latest)
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert financial analyst specializing in extracting financial ratios from annual reports. Your CRITICAL task is to extract ALL financial ratios, especially additional ratios (Current Ratio, Debt-to-Equity, ROE, Quick Ratio, EBITDA Margin). These ratios are ESSENTIAL and are almost always present in annual reports. You MUST:\n1. Search Financial Highlights, MD&A, Financial Review sections FIRST (ratios often pre-calculated there)\n2. Calculate from components if direct values not found\n3. Check Notes to Financial Statements for detailed breakdowns\n4. Use alternative names and synonyms\n5. Only return null if absolutely certain the value cannot be found after exhaustive search\nReturn only valid JSON with all extracted metrics."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=3000,  # Increased token limit for detailed extraction with additional ratios
                temperature=0.1,  # Low temperature for accuracy
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                result = json.loads(result_text)
                
                # Log extraction results for debugging
                additional_ratios = {
                    'current_ratio': result.get('current_ratio'),
                    'debt_to_equity': result.get('debt_to_equity'),
                    'return_on_equity': result.get('return_on_equity'),
                    'quick_ratio': result.get('quick_ratio'),
                    'ebitda_margin': result.get('ebitda_margin')
                }
                ratios_found = sum(1 for v in additional_ratios.values() if v is not None)
                print(f"[Financial Extractor] Additional ratios extracted: {ratios_found}/5 - {additional_ratios}")
                
                normalized = _normalize_extraction_result(result)
                return normalized
                
            except json.JSONDecodeError as e:
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    try:
                        result = json.loads(json_match.group())
                        normalized = _normalize_extraction_result(result)
                        return normalized
                    except:
                        pass
                
                if attempt < max_retries - 1:
                    continue
                return _empty_result(f"JSON parsing error: {str(e)}")
            
        except RateLimitError:
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) * 2
                time.sleep(wait_time)
                continue
            return _empty_result("Rate limit exceeded")
        
        except (APIError, APITimeoutError) as e:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            return _empty_result(f"API error: {str(e)}")
        
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return _empty_result(f"Extraction error: {str(e)}")
    
    return _empty_result("Max retries exceeded")


def _extract_financial_sections(text: str) -> str:
    text_lower = text.lower()
    
    financial_keywords = [
        'balance sheet', 'statement of financial position', 'consolidated balance sheet',
        'income statement', 'statement of operations', 'profit and loss', 'consolidated income',
        'cash flow', 'statement of cash flows', 'consolidated cash flow',
        'notes to financial statements', 'notes to consolidated financial statements',
        'financial statements', 'consolidated financial statements',
        'total assets', 'total liabilities', 'shareholders equity', 'retained earnings',
        'revenue', 'sales', 'ebit', 'operating income', 'net income',
        'current assets', 'current liabilities', 'working capital',
        'inventory', 'inventories', 'quick ratio', 'acid test',
        'debt', 'borrowings', 'total debt', 'long-term debt', 'short-term debt',
        'ebitda', 'depreciation', 'amortization',
        'marketable securities', 'accounts receivable', 'trade receivables'
    ]
    
    paragraphs = text.split('\n\n')
    financial_paragraphs = []
    
    for para in paragraphs:
        para_lower = para.lower()
        score = sum(1 for kw in financial_keywords if kw in para_lower)
        
        if score >= 1:
            financial_paragraphs.append(para)
    
    if financial_paragraphs:
        combined = '\n\n'.join(financial_paragraphs[:100])
        return combined[:20000]
    
    return text[:15000]


def _normalize_extraction_result(result: Dict) -> Dict[str, Any]:
    normalized = {
        "x1": None,
        "x2": None,
        "x3": None,
        "x4": None,
        "x5": None,
        "current_ratio": None,
        "debt_to_equity": None,
        "return_on_equity": None,
        "quick_ratio": None,
        "ebitda_margin": None,
        "confidence": 0.0,
        "source": "not_found",
        "extraction_details": {}
    }
    
    for key in ['x1', 'x2', 'x3', 'x4', 'x5', 'current_ratio', 'debt_to_equity', 'return_on_equity', 'quick_ratio', 'ebitda_margin']:
        value = result.get(key)
        if value is not None:
            try:
                num_value = float(value)
                if not (num_value < -1000 or num_value > 1000):
                    normalized[key] = num_value
            except (ValueError, TypeError):
                pass
    
    confidence = result.get('confidence', 0.0)
    try:
        normalized['confidence'] = max(0.0, min(1.0, float(confidence)))
    except (ValueError, TypeError):
        normalized['confidence'] = 0.0
    
    details = result.get('extraction_details', {})
    normalized['extraction_details'] = details
    
    if any(normalized[k] is not None for k in ['x1', 'x2', 'x3', 'x4', 'x5']):
        normalized['source'] = 'extracted'
    
    return normalized


def _empty_result(reason: str) -> Dict[str, Any]:
    return {
        "x1": None,
        "x2": None,
        "x3": None,
        "x4": None,
        "x5": None,
        "current_ratio": None,
        "debt_to_equity": None,
        "return_on_equity": None,
        "quick_ratio": None,
        "ebitda_margin": None,
        "confidence": 0.0,
        "source": "not_found",
        "extraction_details": {
            "reason": reason
        }
    }

