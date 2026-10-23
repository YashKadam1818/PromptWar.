# EcoPulse AI — Environmental Intelligence Agent

> Autonomous multi-step environmental intelligence agent evaluating real atmospheric data, risk matrices, and targeted public health advisories across **Pune and Pimpri-Chinchwad (Maharashtra, India)**.

![EcoPulse AI MVP](https://img.shields.io/badge/Status-Production%20Ready-6B8E7B)
![Next.js](https://img.shields.io/badge/Next.js-16.4-1F2421?logo=next.js)
![Google Gemini](https://img.shields.io/badge/Model-Gemini%203.8%20Flash-C85A32)
![Open-Meteo](https://img.shields.io/badge/Data-Open--Meteo%20CAMS-387780)
![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passing-6B8E7B)

---

## 🌿 Overview & Mission

EcoPulse AI delivers hyper-local atmospheric intelligence tailored to the microclimates and industrial hubs of the Pune & Pimpri-Chinchwad metropolitan area (Shivajinagar, Hinjawadi Infotech Park, Pimpri Industrial Zone, Bhosari MIDC, Chinchwad, Wakad, Kothrud, Hadapsar, Katraj, and Viman Nagar).

Unlike static dashboards, EcoPulse AI utilizes a **bounded 7-stage server-side agent** that retrieves numerical atmospheric chemistry models, executes deterministic physics and WHO exceedance risk calculations, and synthesizes contextual advisories via **Google Gemini 3.8 Flash**.

---

## 🏛️ Architecture & Bounded Agent

The orchestrator enforces a strictly bounded workflow:

```
[1. Planning] ➡️ [2. Data Retrieval] ➡️ [3. Validation] ➡️ [4. Risk Calculation] ➡️ [5. Gemini Synthesis] ➡️ [6. Output Verification] ➡️ [7. Complete]
```

- **Tool Allowlist Enforcement**:
  - `search_location`: Geocoding resolver for Pune / PCMC neighborhoods.
  - `fetch_air_quality_forecast`: Open-Meteo atmospheric model ingestion.
  - `validate_environmental_data`: Range, physics, and timestamp verification.
  - `calculate_environmental_risk`: Deterministic US AQI, WHO exceedance ratios, and demographic cohort impact matrices.
  - `generate_recommendations`: Structured output generation via `@google/genai` (with deterministic fallback).
  - `verify_agent_output`: Invariant verification preventing hallucinations or health contradictions.
- **Safety Bounds**:
  - Max 7 sequential stages.
  - Max 2 transient network retries.
  - Bounded model calls.
  - 100% server-side secret isolation (`GEMINI_API_KEY` never touches client).
  - Deterministic rules engine fallback if Gemini API key is absent or offline.

---

## 📊 Real Atmospheric Data Integration

- **Provider**: Open-Meteo Air Quality API (`https://air-quality-api.open-meteo.com/v1/air-quality`).
- **Ensemble**: Copernicus Atmosphere Monitoring Service (CAMS) & ECMWF numerical models.
- **Variables**: PM2.5, PM10, Nitrogen Dioxide (NO₂), Sulphur Dioxide (SO₂), Ozone (O₃), Carbon Monoxide (CO), US AQI, European AQI (EAQI).
- **Classification**: Modelled atmospheric chemistry forecasts (not direct hardware sensor observations).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20+` (tested on Node.js `v24.21.0`).
- npm `10+`.

### 2. Installation
```bash
git clone <your-repo-url>
cd ecopulse-ai
npm install
```

### 3. Environment Setup
Copy the template and configure your Gemini API key (optional; deterministic fallback activates automatically if omitted):
```bash
cp .env.example .env.local
```
Inside `.env.local`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Running the Test Suite
All 15 unit and integration tests run via `tsx --test`:
```bash
npm test
```

### 5. Production Build & Local Run
```bash
npm run build
npm start
```
Visit `http://localhost:3000` to inspect the dashboard.

---

## 🧪 Verified Test Results

| Test Suite | Tests Passed | Focus Area |
| :--- | :--- | :--- |
| **Agent Bounds & Invariant Enforcement** | 3 / 3 | 7-stage limit, tool allowlist, deterministic fallback quotes |
| **API Failure & Fault Tolerance** | 3 / 3 | Null pollutant normalization, missing dataset errors, coordinate bounds |
| **Risk Calculator Engine** | 4 / 4 | AQI mapping, WHO ratios, 4 sensitive cohorts, peak forecast detection |
| **Validator & Verification Engine** | 5 / 5 | Physical ranges, bounding checks, contradiction detection, invariant sealing |
| **Total** | **15 / 15 Passed** | **0 Failures** |

---

## 🚢 Deployment Guide

### Deploy to GitHub
```bash
git add .
git commit -m "feat: complete EcoPulse AI MVP with 7-stage bounded agent, tests, and real Open-Meteo data"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Deploy to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Set **Framework Preset** to `Next.js`.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
4. Click **Deploy**. Vercel will build and launch your application globally.
