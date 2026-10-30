# MediAI: Medical Deepfake Detector & Anomaly Localization

A full-stack, multimodal clinical AI system designed to detect and localize synthetic manipulations (deepfakes) in medical radiological imaging (Chest CT/X-ray and Brain MRI scans).

---

## 🔬 System Architecture

The pipeline combines two complementary AI engines for defense-in-depth:

```
[ Uploaded Medical Scan ]
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
[ Member 1: CNN Classifier ]    [ Member 2: YOLOv8 Detector ]
 DenseNet121 Architecture        YOLOv8n Anomaly Localization
 • Real vs. Fake Probability     • Injected Tumor / Tampered Regions
 • Grad-CAM Attention Heatmap    • Two-Pass Adaptive Detection
     │                               │
     └─────────────┬─────────────────┘
                   ▼
       [ Unified Diagnostic Engine ]
         Final Verdict & Consensus
                   ▼
     [ Interactive Frontend UI ]
```

1. **Member 1: Deepfake Classifier (DenseNet-121)**
   - Computes global probability of manipulation (Fake vs. Real).
   - Generates Grad-CAM gradient attention heatmaps to visualize features influencing the decision.

2. **Member 2: Suspicious-Region Localization (YOLOv8n - Improved on dataset03)**
   - Localizes tampered nodule injections, lesion erasures, and synthetic artifacts with bounding boxes.
   - Dual-pass adaptive sensitivity: primary pass (0.28) + secondary sensitive pass (0.24) for faint tampering.
   - Trained on `dataset03` with exact ground-truth bounding boxes and negative/background sample balance to eliminate false alarms.

3. **Member 3: API & Web Application**
   - FastAPI asynchronous backend serving REST endpoints.
   - High-contrast clinical annotations with confidence tags.
   - React + Vite dashboard displaying side-by-side detection views.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (optional, for user authentication and history tracking)

### 2. Backend Setup
```bash
cd backend

# (Optional) Set JWT secret for authentication
set MEDI_AI_JWT_SECRET=your_secure_random_secret_here

# Run YOLO verification test
python test_yolo.py

# Start the FastAPI server on port 8001
uvicorn main:app --reload --port 8001
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎯 Verification Testing

To test YOLO detection independently on authentic vs. manipulated scans:
```bash
cd backend
python test_yolo.py
```
Expected output:
- **Real Scan**: 0 suspicious regions detected (Scan is clean).
- **Fake Scan**: Tampered region accurately identified with coordinates and confidence percentage.

---

## 📊 Dataset: `dataset03`
The model is trained and validated on `dataset03`, featuring:
- **Fake Scans**: CT-GAN & Poisson-blended tumor injections and synthetic lesions across Brain MRI (`Tr-aug-me`) and Chest X-rays (`COVID-19`).
- **Real Scans**: Authentic clinical scans serving as ground-truth controls and background samples.
- **Bounding Boxes**: Exact pixel-level bounding boxes covering the synthetic manipulation footprint.
