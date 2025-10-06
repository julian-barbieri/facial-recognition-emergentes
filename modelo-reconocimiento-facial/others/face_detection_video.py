import cv2
import mediapipe as mp

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
#cap = cv2.VideoCapture("206779.mp4")

# 🔹 Opción A: ventana fija de 400x400
#cv2.namedWindow("Frame", cv2.WINDOW_NORMAL)
#cv2.resizeWindow("Frame", 400, 400)

# 🔹 Opción B: pantalla completa (descomentar si la querés usar)
cv2.namedWindow("Frame", cv2.WINDOW_NORMAL)
cv2.setWindowProperty("Frame", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

with mp_face_detection.FaceDetection(min_detection_confidence=0.1) as face_detection:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Invertir imagen (como espejo)
        #frame = cv2.flip(frame, 1)

        # Convertir a RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)        
        results = face_detection.process(frame_rgb)

        # Contador de caras
        face_count = 0

        if results.detections is not None:
            face_count = len(results.detections)  
            # cantidad de rostros detectados
            for detection in results.detections:
                mp_drawing.draw_detection(
                    frame,
                    detection,
                    mp_drawing.DrawingSpec(color=(0, 255, 255), circle_radius=2),
                    mp_drawing.DrawingSpec(color=(255, 0, 255))
                )

        # Mostrar contador en pantalla
        cv2.putText(frame, f"Caras detectadas: {face_count}", (30, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # Mostrar frame
        cv2.imshow("Frame", frame)

        # Salir con tecla ESC
        k = cv2.waitKey(1) & 0xFF
        if k == 27:
            break

cap.release()
cv2.destroyAllWindows()
