# facial-recognition-emergentes
Sistema de deteccion facial para asistencias en entornos educativos. Se utiliza tecnologias como ExpressJS, Prisma, etc.

Requirements:
NodeJS version >= 22.12.0

Run the following commands:
git clone <url-del-repo>
cd <nombre-del-proyecto>
npm install
npx prisma generate
npx prisma migrate dev # si necesita levantar la DB desde cero
npx prisma studio
npm run dev

#Try endpoint vision
# while running microservice-ai (see microservice-ai README.md)

curl.exe -F image=@C:\Users\julia\workspace\face-recognition\microservice-ai\faces\julian.jpg http://127.0.0.1:8000/v1/infer/face


