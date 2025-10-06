import cv2 
import mediapipe as mp

mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

with mp_face_detection.FaceDetection(
    min_detection_confidence=0.5) as face_detection:
    image = cv2.imread("seleccion_argentina.jpg")
    height, width, _ = image.shape
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_detection.process(image_rgb)
    print("Detections: ", results.detections)
    
    #Dibujar los resultados con MediaPipe
    
    if results.detections is not None:
        for detection in results.detections:
            mp_drawing.draw_detection(image, detection)
    
    cv2.imshow("image", image)
    cv2.waitKey(0)
cv2.destroyAllWindows()