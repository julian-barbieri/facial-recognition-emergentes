# Ejecutar comando
.venv\Scripts\activate

# Estando dentro de ai-service/
uvicorn app:app --host 127.0.0.1 --port 8001 --reload

#Abrir nueva consola y Ejecutar comando
.venv\Scripts\activate

#Ejecutar comando insertandole una imagen para probar
curl.exe -F image=@C:\Users\julia\workspace\face-recognition\microservice-ai\faces\julian.jpg http://127.0.0.1:8000/v1/infer/face


