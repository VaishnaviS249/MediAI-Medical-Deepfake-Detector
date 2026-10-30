import io
import json
import os
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms
from torch import nn


# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "cnn_model.pth"
CLASS_NAMES_PATH = BASE_DIR / "models" / "class_names.json"
DETECTION_DIR = Path(__file__).resolve().parent / "static" / "detections"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def build_model(num_classes=2):
    # Must match Member 1's train.py architecture
    model = models.densenet121(weights=None)
    model.classifier = nn.Linear(model.classifier.in_features, num_classes)
    return model


# Load checkpoint
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"CNN checkpoint not found: {MODEL_PATH}")

checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)

class_to_idx = checkpoint.get("class_to_idx", None)

if class_to_idx:
    idx_to_class = {
        int(index): name.capitalize()
        for name, index in class_to_idx.items()
    }
else:
    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        saved_names = json.load(f)
    idx_to_class = {int(i): n for i, n in saved_names.items()}

FAKE_IDX = next(i for i, n in idx_to_class.items() if n.lower() == "fake")
REAL_IDX = next(i for i, n in idx_to_class.items() if n.lower() == "real")

model = build_model(num_classes=len(idx_to_class))
model.load_state_dict(checkpoint["model_state_dict"])
model.to(DEVICE)
model.eval()


# Same image size and normalization as the training notebook
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def predict_cnn(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.softmax(logits, dim=1)[0]

    predicted_index = int(probabilities.argmax().item())

    return {
        "label": idx_to_class[predicted_index],
        "confidence": round(float(probabilities[predicted_index].item()), 4),
        "prob_fake": round(float(probabilities[FAKE_IDX].item()), 4),
        "prob_real": round(float(probabilities[REAL_IDX].item()), 4),
    }


def gradcam(
    image_path: str,
    target_idx: int = None,
    threshold: float = 0.6,
    is_real: bool = False,
    prob_fake: float = 0.5,
) -> dict:
    """
    Grad-CAM heatmap for the CNN's decision.
    - If fake: highlights focal tampered regions in red/yellow thermal gradients.
    - If real: displays a cool, calm baseline (no red/yellow tampering hotspots).
    """
    pil = Image.open(image_path).convert("RGB")
    inp = transform(pil).unsqueeze(0).to(DEVICE)

    # High-efficiency, low-memory Grad-CAM (detaches upstream conv graph to avoid 121-layer activation RAM explosion)
    with torch.no_grad():
        feat = model.features(inp)

    feat = feat.detach().requires_grad_(True)
    act = F.relu(feat)
    pooled = F.adaptive_avg_pool2d(act, (1, 1)).flatten(1)
    logits = model.classifier(pooled)

    idx = int(logits.argmax(1)) if target_idx is None else target_idx
    logits[0, idx].backward()

    weights = feat.grad.mean(dim=(2, 3), keepdim=True)
    cam = F.relu((weights * act.detach()).sum(dim=1))[0].cpu().numpy()
    del feat, act, pooled, logits, weights
    
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Unable to load image from {image_path}")
    h, w = img.shape[:2]
    cam = cv2.resize(cam, (w, h))

    focus_regions = []
    if is_real:
        # Authentic biological scan: scale to cool range (max <= 0.25 -> dark blue/cyan in JET)
        # Prevents artificial red tampering hotspots on authentic tissue
        cam_norm = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8) * min(0.25, prob_fake)
    else:
        # Tampered fake scan: maps hottest anomaly regions to 0.70 .. 1.0 (bright red/yellow)
        cam_norm = 0.35 + 0.65 * ((cam - cam.min()) / (cam.max() - cam.min() + 1e-8))

        # Extract hot anomaly regions for reference
        mask = (cam_norm >= threshold).astype(np.uint8) * 255
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in sorted(contours, key=cv2.contourArea, reverse=True)[:3]:
            if cv2.contourArea(c) < 0.005 * w * h:
                continue
            x, y, bw, bh = cv2.boundingRect(c)
            focus_regions.append([x, y, x + bw, y + bh])

    heat = cv2.applyColorMap(np.uint8(255 * cam_norm), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.58, heat, 0.42, 0)

    os.makedirs(DETECTION_DIR, exist_ok=True)
    stem = Path(image_path).stem
    out_name = f"heatmap_{stem}.png"
    cv2.imwrite(str(DETECTION_DIR / out_name), overlay)

    return {
        "heatmap_url": f"/static/detections/{out_name}",
        "focus_regions": focus_regions,
    }