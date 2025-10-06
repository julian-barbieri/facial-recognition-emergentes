# ai-service/app.py
import os, time, cv2, numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from deepface import DeepFace

app = FastAPI(title="AI Inference Service", version="1.0.0")

# === Config ===
# Directorio de imágenes de referencia (una imagen por persona, como usabas en "faces/")
FACES_DIR = os.environ.get(
    "FACES_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "faces")
)

# Para acelerar inferencia: si una imagen es muy grande, la reducimos
MAX_SIDE = int(os.getenv("MAX_SIDE", "720"))

def read_image_bytes(file_bytes: bytes):
    """Decodifica bytes -> imagen OpenCV (BGR)."""
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("No se pudo decodificar la imagen (¿archivo corrupto o formato no soportado?).")
    return img

def resize_if_needed(img, max_side=720):
    """Reduce la imagen manteniendo aspecto si supera max_side."""
    h, w = img.shape[:2]
    if max(h, w) > max_side:
        scale = max_side / max(h, w)
        img = cv2.resize(img, (int(w*scale), int(h*scale)))
    return img

@app.get("/healthz")
def healthz():
    """Ping de salud para saber si el servicio está vivo."""
    # También verificamos que exista la carpeta con caras de referencia
    return {"status": "ok", "faces_dir": FACES_DIR, "faces_dir_exists": os.path.isdir(FACES_DIR)}

@app.post("/v1/infer/face")
async def infer_face(image: UploadFile = File(...)):
    """
    Recibe UNA imagen (multipart/form-data, field: 'image').
    Devuelve JSON con una lista de caras: box, nombre (según faces/), emoción y confianza.
    """
    try:
        start = time.time()

        # 1) Leer y preparar imagen
        img = read_image_bytes(await image.read())
        img = cv2.flip(img, 1)            # Efecto espejo (igual que tu script)
        img = resize_if_needed(img, MAX_SIDE)

        # 2) Intentar reconocimiento contra faces/
        try:
            df_list = DeepFace.find(
                img_path=img,
                db_path=FACES_DIR,
                detector_backend='opencv',
                enforce_detection=False,
                silent=True
            )
        except Exception:
            df_list = []

        # Tomamos el mejor match global (top-1) como hacías en tu script
        def best_identity_from_df_list(dfs):
            try:
                if isinstance(dfs, list) and len(dfs) > 0 and len(dfs[0]) > 0:
                    identity_path = dfs[0].iloc[0]['identity']
                    name = os.path.splitext(os.path.basename(identity_path))[0]
                    return name
            except Exception:
                pass
            return "Desconocido"

        name_global = best_identity_from_df_list(df_list)

        # 3) Emociones (como en tu script)
        emo_results = DeepFace.analyze(
            img,
            actions=['emotion'],
            detector_backend='opencv',
            enforce_detection=False
        )

        # DeepFace a veces devuelve dict o list; normalizamos a list
        if not isinstance(emo_results, list):
            emo_results = [emo_results]

        faces = []
        for analysis in emo_results:
            region = analysis.get('region', {}) or {}
            x, y, w, h = [int(region.get(k, 0)) for k in ('x', 'y', 'w', 'h')]

            emotion = analysis.get('dominant_emotion')
            emo_scores = analysis.get('emotion', {}) or {}
            confidence_emotion = emo_scores.get(emotion, None)

            faces.append({
                "box": [x, y, w, h],
                "name": name_global if name_global else "Desconocido",
                "emotion": str(emotion) if emotion else None,
                "emotion_confidence": float(confidence_emotion) if confidence_emotion is not None else None
            })

        return JSONResponse({
            "faces": faces,
            "latency_ms": int((time.time() - start) * 1000)
        })

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
