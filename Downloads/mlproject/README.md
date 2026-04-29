# 📈 Real-Time Stock Market Analysis using LSTM

A full-stack AI-powered web application that predicts stock prices using Long Short-Term Memory (LSTM) neural networks. The app features a Python Fast API backend for machine learning, a Node.js Express API for data persistence, and a modern React frontend built with Vite and Tailwind CSS.

## 🌟 Screenshots

*(Add screenshots here)*

## 🏗 Architecture

```text
+-------------------+       REST API      +-------------------+
|                   |  <----------------> |                   |
|   React + Vite    |                     |   Node.js +       |
|   Frontend        |                     |   Express Backend |
|   (Port 5173)     |  <----------------> |   (Port 5000)     |
+-------------------+       Proxy         +-------------------+
                                                   |     ^
                                                   |     |
                                          Save DB  |     | REST API
                                                   |     |
                                                   v     |
+-------------------+                     +-------------------+
|                   |                     |                   |
|   MongoDB Atlas   |                     |   FastAPI +       |
|   Database        |                     |   Python ML       |
|                   |                     |   (Port 8000)     |
+-------------------+                     +-------------------+
```

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [Python](https://www.python.org/downloads/) (v3.10+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB running)

### 1. Python ML Service Setup
```bash
cd ml-service
# It's recommended to use a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
*The ML service runs at http://localhost:8000*

### 2. Node Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MONGODB_URI
npm run dev
```
*The Node API runs at http://localhost:5000*

### 3. React Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The UI runs at http://localhost:5173*

## 🌐 API Documentation

| Service | Method | Endpoint | Description |
|---|---|---|---|
| Node API | POST | `/api/predict` | Triggers Python ML service, saves result and returns data to frontend |
| Node API | GET | `/api/history` | Returns the recent prediction history |
| Python ML | GET | `/stock-data` | Fetches OHLCV data from Yahoo Finance |
| Python ML | POST | `/train` | (Async) Trains the LSTM model on a background thread |
| Python ML | POST | `/predict` | Loads cache or retrains model, returns future prices and indicators |

## 📊 Sample Stocks to Test

- `RELIANCE.NS` (Reliance Industries)
- `TCS.NS` (Tata Consultancy Services)
- `INFY.NS` (Infosys)
- `HDFCBANK.NS` (HDFC Bank)
- `AAPL` (Apple Inc.)
- `MSFT` (Microsoft Corp.)

## ☁️ Deployment Guide

- **Frontend (Vercel):** Connect your GitHub repo, select the `frontend` root directory, and deploy using standard Vite settings. Add `VITE_API_URL` to point to your deployed backend.
- **Node Backend (Render/Railway):** Connect your repo, select `backend` root. Add `MONGODB_URI` and `PYTHON_ML_URL` environment variables.
- **Python ML Service (Render):** Connect repo, select `ml-service` root. Use Docker or python environment. Be aware of memory limits for TensorFlow.

## 🛠 Troubleshooting

- **Model Training Timeout:** Ensure that Python is serving `/predict` correctly. The first prediction for a new stock could take 30-60 seconds to train the LSTM model.
- **Empty History Table:** Ensure your `MONGODB_URI` points to a valid database cluster and verify network access settings in Atlas.
- **Yahoo Finance Error:** Data might fail to fetch due to aggressive rate limiting. Wait a moment or ensure symbol is correct (using `.NS` for Indian stocks, etc.).
