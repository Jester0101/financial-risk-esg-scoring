# Financial Risk & ESG Scoring System

A comprehensive financial risk assessment system that combines traditional Altman Z-Score analysis with ESG (Environmental, Social, Governance) factors to provide integrated risk scoring.

## Overview

This application calculates financial risk using:
- **Altman Z-Score**: Traditional financial distress prediction model (supports Original, Z'-Score, and Z''-Score formulas)
- **Extended Financial Analysis**: Additional ratios (Current Ratio, Debt-to-Equity, ROE, Quick Ratio, EBITDA Margin)
- **ESG Scoring**: AI-powered analysis of Environmental, Social, and Governance factors using lexicon, TF-IDF, and OpenAI GPT-4o
- **Probability of Default (PD)**: Logistic calibration converting Z-Score to default probability
- **Document Processing**: Automatic extraction of financial data from Annual Reports (PDF, DOCX, TXT) using GPT-4o

## Architecture

The system consists of three main components:

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS) - Port 3000
- **Backend API**: Spring Boot 4.0.1 (Java 17) - Port 8080
- **ESG Service**: FastAPI (Python 3.11) - Port 8000
- **Database**: MongoDB - Port 27017

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17+** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Python 3.11** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **OpenAI API Key** - [Get API Key](https://platform.openai.com/api-keys)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd financial-risk-esg-scoring
```

### 2. MongoDB Setup

Install and start MongoDB:

**Windows:**
- Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Follow installation wizard
- Start MongoDB service: `net start MongoDB` or run `mongod`

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
mongod
```

Verify MongoDB is running:
```bash
mongosh
```

### 3. ESG Service (Python) Setup

Navigate to the ESG service directory:
```bash
cd backend/esg-service
```

Create virtual environment:
```bash
# Windows
py -3.11 -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3.11 -m venv .venv
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Set up OpenAI API key:
```bash
# Windows
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Linux/Mac
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

**Note:** Copy `.env.example` to `.env` and fill in your actual API key (if example file exists).

Start the service:
```bash
uvicorn esg_service.main:app --reload --port 8000
```

Verify the service is running: http://localhost:8000/docs

### 4. Backend API (Java) Setup

Navigate to backend directory:
```bash
cd backend
```

Build and run:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Or build first, then run:
```bash
# Windows
.\mvnw.cmd clean package
java -jar target/risk-scoring-0.0.1-SNAPSHOT.jar

# Linux/Mac
./mvnw clean package
java -jar target/risk-scoring-0.0.1-SNAPSHOT.jar
```

Verify the API is running: http://localhost:8080/api/risk/health

### 5. Frontend (Next.js) Setup

Navigate to frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
# Windows
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Linux/Mac
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
```

Start development server:
```bash
npm run dev
```

Verify the frontend is running: http://localhost:3000

## Quick Start Scripts

### Windows
```bash
start-all.bat
```

### Linux/Mac
```bash
chmod +x start-all.sh
./start-all.sh
```

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080
esg.service.url=http://localhost:8000
spring.data.mongodb.uri=mongodb://localhost:27017/risk-scoring
```

### ESG Service Configuration

Create `backend/esg-service/.env`:
```
OPENAI_API_KEY=your-api-key-here
```

### Frontend Configuration

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Features

### Financial Risk Assessment
- **Manual Input**: Enter financial ratios (X1-X5) manually
- **Document Upload**: Upload Annual Reports (PDF, DOCX, TXT) for automatic extraction
- **Multiple Z-Score Formulas**: 
  - Original Z-Score (1968) - for public manufacturing companies
  - Z'-Score (1983) - for private companies
  - Z''-Score (1995) - for non-manufacturing companies
- **Extended Financial Analysis**: Additional ratios analysis (Current Ratio, Debt-to-Equity, ROE, Quick Ratio, EBITDA Margin)
- **Probability of Default**: Logistic calibration with ESG adjustment

### ESG Analysis
- **Text Analysis**: Analyze ESG factors from text input
- **Document Analysis**: Extract and analyze ESG from Annual Reports
- **Multiple Methods**: Lexicon-based, TF-IDF, and OpenAI GPT-4o scoring
- **Section-based Analysis**: Separate scoring for Environmental, Social, and Governance sections

### Company Management
- **Company Profiles**: Save and manage company profiles
- **Assessment History**: Track historical risk assessments
- **Compare Assessments**: Side-by-side comparison of multiple assessments

## API Endpoints

### Risk Calculation

**POST** `/api/risk/calculate`
- Calculate risk from manual input
- Request body: `RiskInput` (x1, x2, x3, x4, x5, companyName, optional ratios)

**POST** `/api/risk/calculate-with-document`
- Calculate risk with document upload
- Supports multipart/form-data with financial data and document file
- Automatically extracts financial data using GPT-4o

### Company Management

- **GET** `/api/companies` - List all companies
- **POST** `/api/companies` - Create company
- **GET** `/api/companies/{id}` - Get company by ID
- **PUT** `/api/companies/{id}` - Update company
- **DELETE** `/api/companies/{id}` - Delete company
- **GET** `/api/companies/{id}/assessments` - Get company assessments

### Assessment Management

- **GET** `/api/companies/assessments` - List all assessments
- **GET** `/api/companies/assessments/{id}` - Get assessment by ID
- **POST** `/api/companies/assessments/compare` - Compare multiple assessments

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 4.0.1**
- **Spring Data MongoDB**
- **Maven**

### ESG Service
- **Python 3.11**
- **FastAPI**
- **OpenAI GPT-4o**
- **scikit-learn** (TF-IDF)
- **PyPDF2, pdfplumber** (PDF processing)
- **python-docx** (DOCX processing)

### Frontend
- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (Icons)

### Database
- **MongoDB**

## Project Structure

```
financial-risk-esg-scoring/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/          # Java source code
│   │       └── resources/    # Configuration files
│   ├── pom.xml               # Maven dependencies
│   └── Back_explain.md       # Backend documentation
│
├── backend/esg-service/       # Python FastAPI service
│   ├── esg_service/
│   │   ├── main.py           # FastAPI application
│   │   ├── financial_extractor.py  # GPT-4o financial extraction
│   │   ├── document_parser.py      # Document parsing
│   │   └── nlp/              # NLP modules
│   │       ├── scoring.py    # ESG scoring logic
│   │       ├── lexicon.py   # ESG lexicons
│   │       └── openai_scorer.py  # OpenAI integration
│   ├── requirements.txt       # Python dependencies
│   └── .env                  # Environment variables (create this)
│
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   └── lib/              # Utilities and API client
│   ├── package.json          # Node.js dependencies
│   └── .env.local            # Environment variables (create this)
│
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## Usage

### 1. Manual Financial Input

1. Navigate to http://localhost:3000
2. Enter company name (optional)
3. Fill in financial ratios:
   - X1: Working Capital / Total Assets
   - X2: Retained Earnings / Total Assets
   - X3: EBIT / Total Assets
   - X4: Market Value Equity / Total Liabilities
   - X5: Sales / Total Assets
4. Optionally add extended ratios (Current Ratio, Debt-to-Equity, ROE, etc.)
5. Submit to calculate risk

### 2. Document Upload

1. Navigate to http://localhost:3000
2. Enter company name
3. Upload Annual Report (PDF, DOCX, or TXT)
4. System automatically extracts:
   - Financial ratios (X1-X5)
   - Extended financial ratios
   - ESG scores
5. Review extracted data and submit

### 3. View Results

Results include:
- **Z-Score**: Original calculated value
- **Risk Zone**: Distress Zone, Grey Zone, or Safe Zone
- **Probability of Default**: Baseline, Adjusted (with extended financial), and Enhanced (with ESG)
- **ESG Scores**: Environmental, Social, and Governance scores
- **Risk Summary**: Visual risk assessment with grade (A-E)
- **Comparison**: Breakdown of financial vs ESG impact

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `application.properties`
- Check MongoDB logs

### ESG Service Not Responding
- Check if service is running on port 8000
- Verify `.env` file exists with valid OpenAI API key
- Check Python virtual environment is activated
- Review service logs

### Backend API Errors
- Verify Java 17+ is installed: `java -version`
- Check MongoDB connection
- Ensure ESG service is running
- Review application logs

### Frontend Issues
- Clear browser cache
- Verify `.env.local` file exists
- Check API URL is correct
- Review browser console for errors

## Development

### Running Tests

**Backend:**
```bash
cd backend
.\mvnw.cmd test
```

**Frontend:**
```bash
cd frontend
npm run lint
```

### Building for Production

**Backend:**
```bash
cd backend
.\mvnw.cmd clean package
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Altman Z-Score methodology by Edward Altman
- OpenAI GPT-4o for financial data extraction and ESG analysis
- Spring Boot and FastAPI communities
