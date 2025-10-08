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
# Detector de rostros; intenta primero este y luego cae a otros si no hay caras
DETECTOR_BACKEND = os.getenv("DETECTOR_BACKEND", "opencv")  # opciones: opencv, retinaface, mtcnn, ssd, yolov8, etc.
# Factor de reescalado para reintentar detección si no se encuentran rostros
DETECT_UPSCALE = float(os.getenv("DETECT_UPSCALE", "1.5"))

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

@app.get("/v1/identities")
def list_identities():
    """Lista identidades conocidas según el contenido de FACES_DIR.
    - Si hay subcarpetas, cada carpeta es una identidad.
    - Si no hay subcarpetas, usa los nombres de archivo (sin extensión).
    """
    try:
        if not os.path.isdir(FACES_DIR):
            return JSONResponse({"identities": []})

        entries = [os.path.join(FACES_DIR, e) for e in os.listdir(FACES_DIR)]
        folder_identities = [os.path.basename(p) for p in entries if os.path.isdir(p)]
        if folder_identities:
            return JSONResponse({"identities": sorted(list(set(folder_identities)))})

        # fallback: archivos sueltos (solo extensiones de imagen)
        IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
        file_identities = []
        for p in entries:
            if os.path.isfile(p):
                base = os.path.basename(p)
                name, ext = os.path.splitext(base)
                if ext.lower() in IMAGE_EXTS and name:
                    file_identities.append(name)
        return JSONResponse({"identities": sorted(list(set(file_identities)))})
    except Exception as e:
        return JSONResponse({"identities": [], "error": str(e)}, status_code=500)

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

        # 2) Emociones (como en tu script) y regiones por rostro
        def run_analyze(image_bgr, backend):
            return DeepFace.analyze(
                image_bgr,
                actions=['emotion'],
                detector_backend=backend,
                enforce_detection=False
            )

        # Primer intento con backend configurado
        emo_results = run_analyze(img, DETECTOR_BACKEND)

        # DeepFace a veces devuelve dict o list; normalizamos a list
        if not isinstance(emo_results, list):
            emo_results = [emo_results]

        def no_faces_detected(results):
            if not results:
                return True
            # considera "sin rostro" si todas las regiones son 0 o muy pequeñas
            for a in results:
                r = (a.get('region') or {})
                if int(r.get('w', 0)) > 0 and int(r.get('h', 0)) > 0:
                    return False
            return True

        # Si no detectó rostros, probamos fallbacks de detector
        if no_faces_detected(emo_results):
            fallback_backends = []
            if DETECTOR_BACKEND != 'retinaface':
                fallback_backends.append('retinaface')
            if DETECTOR_BACKEND != 'mtcnn':
                fallback_backends.append('mtcnn')

            tried = [DETECTOR_BACKEND]
            for fb in fallback_backends:
                try:
                    emo_results_fb = run_analyze(img, fb)
                    if not isinstance(emo_results_fb, list):
                        emo_results_fb = [emo_results_fb]
                    if not no_faces_detected(emo_results_fb):
                        emo_results = emo_results_fb
                        tried.append(fb)
                        break
                    tried.append(fb)
                except Exception:
                    tried.append(fb)

        # Si aún no hay rostros, reintenta a mayor escala para caras pequeñas
        if no_faces_detected(emo_results) and DETECT_UPSCALE and DETECT_UPSCALE > 4.0:
            h0, w0 = img.shape[:2]
            up_w = int(w0 * DETECT_UPSCALE)
            up_h = int(h0 * DETECT_UPSCALE)
            img_up = cv2.resize(img, (up_w, up_h))
            emo_results_up = run_analyze(img_up, DETECTOR_BACKEND)
            if not isinstance(emo_results_up, list):
                emo_results_up = [emo_results_up]
            if not no_faces_detected(emo_results_up):
                # mapeamos las cajas de vuelta a la escala original
                mapped = []
                for a in emo_results_up:
                    r = (a.get('region') or {}).copy()
                    if r:
                        r['x'] = int(r.get('x', 0) / DETECT_UPSCALE)
                        r['y'] = int(r.get('y', 0) / DETECT_UPSCALE)
                        r['w'] = int(r.get('w', 0) / DETECT_UPSCALE)
                        r['h'] = int(r.get('h', 0) / DETECT_UPSCALE)
                        a = a.copy()
                        a['region'] = r
                    mapped.append(a)
                emo_results = mapped

        # Umbral para decidir si un match es confiable (distancia)
        # Valores típicos DeepFace (cosine) ~0.3-0.5; ajusta según tus datos
        threshold = float(os.getenv("RECOG_THRESHOLD", "0.9"))

        def infer_identity_for_crop(crop_img):
            try:
                df_list_local = DeepFace.find(
                    img_path=crop_img,
                    db_path=FACES_DIR,
                    detector_backend='opencv',  # detecta dentro del recorte
                    enforce_detection=False,
                    silent=True
                )
            except Exception:
                df_list_local = []

            try:
                if isinstance(df_list_local, list) and len(df_list_local) > 0 and len(df_list_local[0]) > 0:
                    top_row = df_list_local[0].iloc[0]
                    distance = float(top_row.get('distance', 1.0))
                    identity_path = top_row.get('identity', '')
                    if distance <= threshold and identity_path:
                        folder_name = os.path.basename(os.path.dirname(identity_path))
                        if folder_name and folder_name != os.path.basename(FACES_DIR):
                            return folder_name
                        # fallback: nombre de archivo
                        return os.path.splitext(os.path.basename(identity_path))[0]
            except Exception:
                pass
            return "Desconocido"

        def clip(val, low, high):
            return max(low, min(int(val), high))

        faces = []
        h_img, w_img = img.shape[:2]
        for analysis in emo_results:
            region = analysis.get('region', {}) or {}
            x, y, w, h = [int(region.get(k, 0)) for k in ('x', 'y', 'w', 'h')]

            # Padding leve para incluir bordes del rostro
            pad = 0.15
            x1 = clip(x - w*pad, 0, w_img - 1)
            y1 = clip(y - h*pad, 0, h_img - 1)
            x2 = clip(x + w*(1+pad), 0, w_img)
            y2 = clip(y + h*(1+pad), 0, h_img)

            crop = img[y1:y2, x1:x2]

            # Identidad por rostro usando el recorte
            name_local = infer_identity_for_crop(crop)

            emotion = analysis.get('dominant_emotion')
            emo_scores = analysis.get('emotion', {}) or {}
            confidence_emotion = emo_scores.get(emotion, None)

            faces.append({
                "box": [x, y, w, h],
                "name": name_local,
                "emotion": str(emotion) if emotion else None,
                "emotion_confidence": float(confidence_emotion) if confidence_emotion is not None else None
            })

        return JSONResponse({
            "faces": faces,
            "latency_ms": int((time.time() - start) * 1000)
        })

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))