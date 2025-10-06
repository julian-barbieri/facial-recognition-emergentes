import cv2
import os

# Carpeta con imágenes originales
imagesPath = r"C:\Users\julia\workspace\face-recognition\modelo-reconocimiento-facial\fotos_caras"

# Carpeta donde guardaremos los rostros extraídos
if not os.path.exists("faces"):
    os.makedirs("faces")
    print("Nueva carpeta creada: faces")

# Cargamos clasificador HaarCascade
faceClassif = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

count = 0
for imageName in os.listdir(imagesPath):
    print(f"Procesando: {imageName}")
    image = cv2.imread(imagesPath + "/" + imageName)
    if image is None:
        continue

    faces = faceClassif.detectMultiScale(image, 1.1, 5)

    for (x, y, w, h) in faces:
        face = image[y:y + h, x:x + w]
        face = cv2.resize(face, (150, 150))
        cv2.imwrite(f"faces/{count}.jpg", face)
        count += 1

print(f"Total de caras guardadas: {count}")
