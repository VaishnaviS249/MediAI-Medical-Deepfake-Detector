import os
from pathlib import Path
from yolo_service import MedicalYOLOService

# Create YOLO detector
detector = MedicalYOLOService("../models/best.pt")

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR.parent / "uploads"

test_cases = [
    ("Authentic Real Scan (Negative Control)", UPLOADS_DIR / "COVID-214.png"),
    ("Synthetic GAN Deepfake Scan (Positive Detection)", UPLOADS_DIR / "gan_COVID-214.png"),
]

print("==================================================")
print("       MEDIAL YOLO DETECTION VERIFICATION         ")
print("==================================================")

for label, img_path in test_cases:
    print(f"\n--- Testing: {label} ---")
    print(f"Path: {img_path}")

    if not img_path.exists():
        print(f"[!] Warning: Image not found at {img_path}")
        continue

    result = detector.analyze_scan(str(img_path))

    print(f"Tampering Detected  : {result['tampering_detected']}")
    print(f"Region Count        : {result['region_count']}")
    print(f"Low Confidence Pass : {result.get('low_confidence_pass', False)}")
    print(f"Annotated Image     : {result['annotated_image_url']}")

    if result["suspicious_regions"]:
        print("Suspicious Regions:")
        for idx, region in enumerate(result["suspicious_regions"], 1):
            print(f"  [{idx}] Class: {region['classification']} | Confidence: {region['confidence']}% | Box: {region['bounding_box']}")
    else:
        print("No suspicious regions detected (Scan is clean).")

print("\n==================================================")
