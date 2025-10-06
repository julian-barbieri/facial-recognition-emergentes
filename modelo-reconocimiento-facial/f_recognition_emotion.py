import cv2
from deepface import DeepFace
import logging
import os

# Desactivar logs molestos de DeepFace
logging.getLogger("deepface").setLevel(logging.ERROR)

# Ruta a carpeta con imágenes de referencia
db_path = os.environ.get(
    "FACES_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "faces")
)

# Captura desde la cámara
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

frame_count = 0
process_every = 5   # procesar cada 5 frames
results = []        # guardar último análisis

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)  # Efecto espejo

    if frame_count % process_every == 0:
        try:
            # 1️⃣ Reconocimiento facial contra la carpeta "faces/"
            df = DeepFace.find(
                img_path=frame,
                db_path=db_path,
                detector_backend='opencv',
                enforce_detection=False,
                silent=True
            )

            # 2️⃣ Emoción de cada cara detectada
            emo_results = DeepFace.analyze(
                frame,
                actions=['emotion'],
                detector_backend='opencv',
                enforce_detection=False
            )

            if not isinstance(emo_results, list):
                emo_results = [emo_results]

            results = []
            for i, analysis in enumerate(emo_results):
                region = analysis['region']
                x, y, w, h = region['x'], region['y'], region['w'], region['h']
                emotion = analysis['dominant_emotion']

                # 🔹 confianza de la emoción
                confidence_emotion = analysis['emotion'][emotion]

                # Si hay resultados de reconocimiento, tomamos el primero
                try:
                    identity_path = df[0].iloc[0]['identity']
                    name = os.path.splitext(os.path.basename(identity_path))[0]

                except:
                    name = "Desconocido"
                    

                results.append((x, y, w, h, name, emotion, confidence_emotion))

        except Exception as e:
            results = []

    # Dibujar resultados
    for (x, y, w, h, name, emotion, confidence_emotion) in results:
        
        color = (0, 255, 0) if name != "Desconocido" else (0, 0, 255)

        # Rectángulo alrededor de la cara
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

        # Nombre ARRIBA con confianza
        cv2.rectangle(frame, (x, y - 25), (x + w, y), color, -1)
        
        # Emoción ABAJO del rectángulo 
        cv2.rectangle(frame, (x, y + h), (x + w, y + h + 25), color, -1)

        cv2.putText(
            frame,
            f"{name}",
            (x + 5, y - 7),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,               # letra más chica
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        cv2.putText(
            frame,
            f"{emotion} {confidence_emotion:.1f}%",
            (x + 5, y + h + 18),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,               # letra más chica
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

    cv2.imshow("Frame", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC para salir
        break

    frame_count += 1

cap.release()
cv2.destroyAllWindows()
