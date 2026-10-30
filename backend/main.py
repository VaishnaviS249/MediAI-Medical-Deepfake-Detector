from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from auth import router as auth_router
import shutil
import os
import uuid

from yolo_service import MedicalYOLOService
from cnn_service import predict_cnn, gradcam


# Create FastAPI application
app = FastAPI(
    title="MRI Suspicious Region Detection API",
    description="YOLO-based suspicious region localization",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)

# =========================
# Folder paths
# =========================
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = str(BASE_DIR.parent / "uploads")
DETECTION_FOLDER = str(BASE_DIR / "static" / "detections")

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DETECTION_FOLDER, exist_ok=True)


# =========================
# YOLO Model
# =========================

detector = MedicalYOLOService()


# =========================
# Serve annotated images
# =========================

app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static"
)


# =========================
# Home endpoint
# =========================

@app.get("/")
def home():

    return {
        "message": "MRI Detection API is running"
    }


# =========================
# Analyze image
# =========================


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Read the uploaded image once
    contents = await file.read()

    # Save the image for processing
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Member 1: CNN classification (Real or Fake) - 100% ORIGINAL & UNTOUCHED
    cnn_result = predict_cnn(contents)
    is_real = (cnn_result.get("label") == "Real")

    # Member 2: YOLO suspicious-region detection with precise lesion localization
    yolo_result = detector.analyze_scan(file_path)

    if is_real:
        # LOGICAL RULE: If the scan is authentic (Real), there is NO tampering!
        final_verdict = "Real"
        verdict_source = "Authentic Biological Scan (No Tampering Detected)"

        # Set YOLO tampering to False and clear false-positive boxes on normal tissue
        yolo_result["tampering_detected"] = False
        yolo_result["region_count"] = 0
        yolo_result["suspicious_regions"] = []
        yolo_result["low_confidence_pass"] = False

        # Save pristine clean scan as annotated image (no red boxes)
        clean_name = f"detected_clean_{uuid.uuid4().hex}.jpg"
        clean_path = os.path.join(DETECTION_FOLDER, clean_name)
        shutil.copyfile(file_path, clean_path)
        yolo_result["annotated_image_url"] = f"/static/detections/{clean_name}"
    else:
        # Fake scan: GAN deepfake artifacts detected
        final_verdict = "Fake"
        verdict_source = (
            "CNN & YOLO Agreement (Deepfake Confirmed)"
            if yolo_result.get("tampering_detected")
            else "CNN Classifier (Deepfake Artifacts Detected)"
        )
        # Ensure YOLO tampering_detected reflects the confirmed fake finding
        yolo_result["tampering_detected"] = True

    # Grad-CAM pure thermal heatmap (without white bounding box)
    try:
        cam_info = gradcam(
            file_path,
            is_real=is_real,
            prob_fake=cnn_result.get("prob_fake", 0.5),
        )
        cnn_result["heatmap_url"] = cam_info.get("heatmap_url")
    except Exception as e:
        print(f"[Grad-CAM] Notice: {e}")
        cnn_result["heatmap_url"] = None

    # Return results to the frontend
    return JSONResponse(content={
        "filename": file.filename,
        "result": yolo_result,
        "cnn_result": cnn_result,
        "final_verdict": final_verdict,
        "verdict_source": verdict_source
    })
