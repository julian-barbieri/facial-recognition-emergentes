import express from "express";
import userRoutes from './routes/user.js';
import subjectRoutes from './routes/subject.js';
import faceVectorRoutes from './routes/faceVector.js';
import attendanceRoutes from './routes/attendance.js';

const app = express();
app.set("case sensitive routing", true);
app.set('appName', 'Attendance Face Recognition');
app.set("port", 3000);

app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", subjectRoutes);
app.use("/api", faceVectorRoutes);
app.use("/api", attendanceRoutes);

app.listen(app.get("port"));
console.log(`server ${app.get("appName")} on port ${app.get("port")}`);
