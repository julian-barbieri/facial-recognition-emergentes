import {Router} from "express";
import { prisma } from "../../db.js"; 
const router = Router();

// Obtener todas las asistencias
router.get("/classes", async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        attendances: true,
        subject: true,
      }
    });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching classes" });
  }
});

// Obtener asistencia por ID
router.get("/classes/:id", async (req, res) => {
  try {
    const lesson = await prisma.class.findUnique({
      where: {
        id: parseInt(req.params.id)
      },
      //include -> para mostrar el objeto con sus atributos del student y subject
      include: {
        attendances: true,
        subject: true,
      }
    });

    if (!lesson) return res.status(404).json({ error: "Class not found" });
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching class" });
  }
});

// Crear una asistencias
router.post("/classes", async (req, res) => {

  const { subjectId, attendances, date } = req.body;
  if (!subjectId) {
    return res.status(400).json({ error: "SubjectId is required" });
  }

  try {
    const lesson = await prisma.class.create({
      data: {
        subjectId,
        date: date ? new Date(date) : new Date(),
        ...(attendances && attendances.length > 0 && {
          attendances: {
            create: attendances
          }
        })
      },
      include: {
        attendances: true,
        subject: true,
      }
    });

    res.status(201).json(lesson);
  } catch (err) {
    console.error("Error creating class:", err);
    res.status(500).json({ error: "Error creating class" });
  }
});

/**
 * PUT attendance user by id
 */
router.put("/classes/:id", async (req, res) => {
  try {
    const updatedClass = await prisma.class.update({
      where: { 
        id: parseInt(req.params.id) 
      },
      data: req.body,
    });
    res.json(updatedClass);
  } catch (err) {
    //Cuando no se encuentra al Class devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Class not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error updating class" });
  }
});

/**
 * DELETE attendance by id
 */
router.delete("/classes/:id", async (req, res) => {
  try {
    const deletedClass = await prisma.class.delete({
        where: {
            id: parseInt(req.params.id)
        }
    });
    res.json(deletedClass);
  } catch (err) {
    //Cuando no se encuentra al attendance devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Class not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error deleting class" });
  }
});



export default router;