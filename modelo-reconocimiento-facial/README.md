Modelo de Reconocimiento Facial (DeepFace + OpenCV)

Esta repo permite:
- Extraer rostros desde una foto y guardarlos en `faces/`.
- Usar la cámara para reconocer si una persona coincide con las fotos de `faces/` y mostrar su emoción dominante.

Requisitos
- Windows 10/11 con Python 3.9–3.11 instalado (x64)
- Microsoft Visual C++
- Cámara web
- Git instalado si vas a clonar

Instalación (PowerShell)
```powershell
# 1) Clonar o descargar
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>

# 2) (Opcional pero recomendado) Crear venv
python -m venv venv
venv\Scripts\Activate.ps1

# 3) Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt
pip install deepface --no-deps
```

Preparar la foto de referencia
- Copia una o más fotos con rostros a una carpeta de tu PC.
- Edita el archivo `extracting_faces.py` y cambia la variable `imagesPath` por la ruta donde pusiste tus fotos. Ejemplo:
```python
imagesPath = r"C:\\Users\\<TU_USUARIO>\\Imágenes\\mis_caras"
```

Extraer rostros a `faces/`
```powershell
python extracting_faces.py
```
Esto detectará rostros en cada imagen de `imagesPath`, los recortará a 150x150 y los guardará como `faces/0.jpg`, `faces/1.jpg`, etc.

Reconocimiento + Emoción con la cámara
```powershell
python f_recognition_emotion.py
```
- Se abrirá la cámara.
- El script buscará coincidencias contra las imágenes en `faces/` y mostrará la emoción dominante.
- Pulsa `ESC` para salir.

Notas importantes
- Carpeta de base de datos: en `f_recognition_emotion.py` la variable `db_path` apunta, por defecto, a `faces/` dentro del proyecto. Ajusta la ruta si moviste la carpeta.
- Modelos de DeepFace: la primera ejecución puede descargar modelos preentrenados (requiere internet). Esto puede tardar.
- Rendimiento: en `f_recognition_emotion.py` se procesa cada 5 frames (`process_every = 5`) para aligerar CPU; puedes ajustar ese valor.

Subir el modelo a GitHub
- Si decides versionar archivos grandes (por ejemplo, `.pkl` en `faces/`), usa Git LFS para evitar límites de tamaño.
```powershell
git lfs install
git lfs track "faces/*.pkl"
git add .gitattributes
git add faces/*.pkl
git commit -m "Agregar modelo .pkl con LFS"
git push
```

Solución de problemas
- No reconoce a nadie:
	- Asegúrate de que `faces/` tiene al menos una imagen clara del rostro de la persona.
	- Verifica que `db_path` apunta correctamente a `faces/`.
	- Buena iluminación y rostro centrado ayudan.
- Error de cámara (no abre):
	- Cierra otras apps que usen la webcam.
	- Prueba `cv2.VideoCapture(0)` sin `cv2.CAP_DSHOW` si usas otra cámara.
- Errores de instalación (TensorFlow/numPy):
	- Asegúrate de usar Python 3.9–3.11 x64.
	- Ejecuta `pip install --upgrade pip` antes de instalar.

Ejecución rápida (resumen)
```powershell
# Edita la ruta en extracting_faces.py -> imagesPath
python extracting_faces.py
python f_recognition_emotion.py
```

Licencia
Este proyecto es para fines educativos/demostrativos.

