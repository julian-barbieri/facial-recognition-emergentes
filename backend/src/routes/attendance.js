import {Router} from "express";
import { prisma } from "../../db.js"; 
const router = Router();

// Obtener todas las asistencias
router.get("/attendances", async (req, res) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        student: true,
        subject: true,
      }
    });
    res.json(attendances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching attendances" });
  }
});

// Obtener asistencia por ID
router.get("/attendances/:id", async (req, res) => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: {
        id: parseInt(req.params.id)
      },
      //include -> para mostrar el objeto con sus atributos del student y subject
      include: {
        student: true,
        subject: true,
      }
    });

    if (!attendance) return res.status(404).json({ error: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching attendance" });
  }
});

// Crear una asistencias
router.post("/attendances", async (req, res) => {
  //Status sera PRESENT por default   
  const { studentId, subjectId, status = "PRESENT", timestamp } = req.body;

  if (!studentId || !subjectId) {
    return res.status(400).json({ error: "studentId and subjectId are required" });
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        subjectId,
        status,
        ...(timestamp && { timestamp: new Date(timestamp) })  // solo si se envía
      }
    });

    res.status(201).json(attendance);
  } catch (err) {
    console.error("Error creating attendance:", err);
    res.status(500).json({ error: "Error creating attendance" });
  }
});

/**
 * PUT attendance user by id
 */
router.put("/attendances/:id", async (req, res) => {
  try {
    const updatedAttendance = await prisma.attendance.update({
      where: { 
        id: parseInt(req.params.id) 
      },
      data: req.body,
    });
    res.json(updatedAttendance);
  } catch (err) {
    //Cuando no se encuentra al attendance devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Attendance not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error updating attendance" });
  }
});

/**
 * DELETE attendance by id
 */
router.delete("/attendances/:id", async (req, res) => {
  try {
    const deletedAttendance = await prisma.attendance.delete({
        where: {
            id: parseInt(req.params.id)
        }
    });
    res.json(deletedAttendance);
  } catch (err) {
    //Cuando no se encuentra al attendance devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Attendance not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error deleting attendance" });
  }
});



export default router;