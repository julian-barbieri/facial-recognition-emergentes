import cv2
from deepface import DeepFace
import logging

# Desactivar logs molestos de DeepFace
logging.getLogger("deepface").setLevel(logging.ERROR)

# Captura desde la cámara
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

frame_count = 0
process_every = 5   # procesar cada 5 frames para más fluidez
emo_results = []    # guardar último resultado válido

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)  # Efecto espejo

    # Solo analizamos cada 5 frames
    if frame_count % process_every == 0:
        try:
            emo_results = DeepFace.analyze(
                frame,
                actions=['emotion'],
                detector_backend='opencv',   # más rápido que retinaface
                enforce_detection=False
            )
            if not isinstance(emo_results, list):
                emo_results = [emo_results]
        except:
            emo_results = []

    # Dibujar resultados
    for analysis in emo_results:
        region = analysis['region']
        x, y, w, h = region['x'], region['y'], region['w'], region['h']
        emotion = analysis['dominant_emotion']

        # Rectángulo alrededor de la cara
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Fondo para el texto (debajo del rostro)
        cv2.rectangle(frame, (x, y + h), (x + w, y + h + 30), (0, 255, 0), -1)

        # Mostrar emoción
        cv2.putText(
            frame,
            f"{emotion}",
            (x + 5, y + h + 22),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

    cv2.imshow("Frame", frame)

    # Salir con ESC
    if cv2.waitKey(1) & 0xFF == 27:
        break

    frame_count += 1

cap.release()
cv2.destroyAllWindows()
