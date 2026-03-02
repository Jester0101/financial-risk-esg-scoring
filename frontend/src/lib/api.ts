const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const ESG_SERVICE_URL = process.env.NEXT_PUBLIC_ESG_SERVICE_URL || 'http://localhost:8000';

export interface RiskInput {
  x1: number;
  x2: number;
  x3: number;
  x4: number;
  x5: number;
  esgText?: string;
  companyName?: string;
  currentRatio?: number;
  debtToEquity?: number;
  returnOnEquity?: number;
  quickRatio?: number;
  ebitdaMargin?: number;
}

export interface RiskResult {
  zScore: number;
  riskZone: string;
  esgScore: number;
  esgExplanation?: string;
  compositeScore: number;
  timestamp: string;
  pBaseline?: number;
  pAdjusted?: number;
  pEnhanced?: number;
  esgMethodVersion?: string;
  esgTopTerms?: string;
  esgRiskFlags?: string;
}

export interface AssessmentResponse {
  result: RiskResult;
  documentStats?: {
    filename: string;
    file_size_mb: number;
    num_pages?: number;
    text_words?: number;
  };
  documentSections?: Record<string, {
    e: number;
    s: number;
    g: number;
    esg_total: number;
  }>;
  financialExtraction?: {
    extracted: boolean;
    confidence: number;
    extractionDetails?: Record<string, any>;
  };
  /** Shown when document was used but Z-Score inputs could not be extracted (instead of silently showing Z-Score 0). */
  zScoreExtractionMessage?: string;
}

export async function calculateRisk(input: RiskInput): Promise<RiskResult> {
  try {
    const response = await fetch(`${API_URL}/api/risk/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to calculate risk';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: any) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to server at ${API_URL}. Please check if the backend is running.`);
    }
    throw err;
  }
}

export async function calculateRiskWithDocument(
  input: RiskInput,
  file?: File,
  esgText?: string,
  useOpenai: boolean = true,
  useExtractedFinancial: boolean = false
): Promise<AssessmentResponse> {
  const formData = new FormData();
  
  formData.append('x1', input.x1.toString());
  formData.append('x2', input.x2.toString());
  formData.append('x3', input.x3.toString());
  formData.append('x4', input.x4.toString());
  formData.append('x5', input.x5.toString());
  
  if (input.companyName) formData.append('companyName', input.companyName);
  if (input.currentRatio !== undefined) formData.append('currentRatio', input.currentRatio.toString());
  if (input.debtToEquity !== undefined) formData.append('debtToEquity', input.debtToEquity.toString());
  if (input.returnOnEquity !== undefined) formData.append('returnOnEquity', input.returnOnEquity.toString());
  if (input.quickRatio !== undefined) formData.append('quickRatio', input.quickRatio.toString());
  if (input.ebitdaMargin !== undefined) formData.append('ebitdaMargin', input.ebitdaMargin.toString());
  
  if (file) {
    formData.append('esgDocument', file);
  }
  
  if (esgText) {
    formData.append('esgText', esgText);
  }
  
  formData.append('useOpenai', useOpenai.toString());
  formData.append('useExtractedFinancial', useExtractedFinancial.toString());

  try {
    const response = await fetch(`${API_URL}/api/risk/calculate-with-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to calculate risk with document';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: any) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to server at ${API_URL}. Please check if the backend is running.`);
    }
    throw err;
  }
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_URL}/api/risk/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

export interface EsgScoreRequest {
  text: string;
  use_openai?: boolean;
  openai_key?: string;
}

export interface EsgScoreResponse {
  e: number;
  s: number;
  g: number;
  esg_total: number;
  risk_flags: string[];
  top_terms: string[];
  method_version: string;
}

export interface FinancialExtractionResponse {
  x1?: number | null;
  x2?: number | null;
  x3?: number | null;
  x4?: number | null;
  x5?: number | null;
  current_ratio?: number | null;
  debt_to_equity?: number | null;
  return_on_equity?: number | null;
  quick_ratio?: number | null;
  ebitda_margin?: number | null;
  confidence: number;
  source: string;
  extraction_details: Record<string, any>;
}

export async function scoreEsgText(
  text: string,
  useOpenai: boolean = true
): Promise<EsgScoreResponse> {
  const response = await fetch(`${ESG_SERVICE_URL}/esg/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      use_openai: useOpenai,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to score ESG');
  }

  return response.json();
}

export async function scoreEsgDocument(
  file: File,
  useOpenai: boolean = true
): Promise<EsgDocumentScoreResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('use_openai', useOpenai.toString());

  const response = await fetch(`${ESG_SERVICE_URL}/esg/score-document`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to score ESG document');
  }

  return response.json();
}

export interface EsgDocumentScoreResponse {
  e: number;
  s: number;
  g: number;
  esg_total: number;
  risk_flags: string[];
  top_terms: string[];
  method_version: string;
  sections: Record<string, {
    e: number;
    s: number;
    g: number;
    esg_total: number;
  }>;
  document_stats: {
    filename: string;
    file_size_mb: number;
    num_pages?: number;
    text_length: number;
    text_words: number;
    sections_found: number;
    environmental_section_length: number;
    social_section_length: number;
    governance_section_length: number;
    ocr_used: boolean;
  };
}

export async function extractFinancialData(
  file: File
): Promise<FinancialExtractionResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${ESG_SERVICE_URL}/financial/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to extract financial data';
      try {
        const error = await response.json();
        errorMessage = error.detail || error.error || error.message || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (err: any) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ESG service at ${ESG_SERVICE_URL}. Please check if the service is running.`);
    }
    throw err;
  }
}

export interface Company {
  id?: string;
  name: string;
  industry?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  assessmentIds?: string[];
}

export interface Assessment {
  id?: string;
  companyId?: string;
  companyName?: string;
  input: RiskInput;
  result: RiskResult;
  metadata?: {
    documentStats?: {
      filename?: string;
      fileSizeMb?: number;
      numPages?: number;
      textWords?: number;
    };
    documentSections?: Record<string, any>;
    financialExtraction?: {
      extracted?: boolean;
      confidence?: number;
      extractionDetails?: Record<string, any>;
    };
    zScoreExtractionMessage?: string;
  };
  createdAt?: string;
}

export async function getAllCompanies(): Promise<Company[]> {
  const response = await fetch(`${API_URL}/api/companies`);
  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }
  return response.json();
}

export async function getCompany(id: string): Promise<Company> {
  const response = await fetch(`${API_URL}/api/companies/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch company');
  }
  return response.json();
}

export async function createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  const response = await fetch(`${API_URL}/api/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(company),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to create company' }));
    throw new Error(error.error || 'Failed to create company');
  }
  return response.json();
}

export async function updateCompany(id: string, company: Partial<Company>): Promise<Company> {
  const response = await fetch(`${API_URL}/api/companies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(company),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update company' }));
    throw new Error(error.error || 'Failed to update company');
  }
  return response.json();
}

export async function deleteCompany(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/companies/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete company');
  }
}

export async function getCompanyAssessments(companyId: string): Promise<Assessment[]> {
  const response = await fetch(`${API_URL}/api/companies/${companyId}/assessments`);
  if (!response.ok) {
    throw new Error('Failed to fetch company assessments');
  }
  return response.json();
}

export async function getAllAssessments(limit?: number): Promise<Assessment[]> {
  const url = limit ? `${API_URL}/api/companies/assessments?limit=${limit}` : `${API_URL}/api/companies/assessments`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch assessments');
  }
  return response.json();
}

export async function getAssessment(id: string): Promise<Assessment> {
  const response = await fetch(`${API_URL}/api/companies/assessments/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assessment');
  }
  return response.json();
}

export async function deleteAssessment(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/companies/assessments/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete assessment');
  }
}

export async function compareAssessments(assessmentIds: string[]): Promise<Assessment[]> {
  const response = await fetch(`${API_URL}/api/companies/assessments/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assessmentIds),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to compare assessments' }));
    throw new Error(error.error || 'Failed to compare assessments');
  }
  return response.json();
}



