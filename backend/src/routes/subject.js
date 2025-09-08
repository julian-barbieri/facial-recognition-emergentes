import { Router } from "express";
import { prisma } from "../../db.js";

const router = Router();

// Obtener todas las materias
router.get("/subjects", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: true,
        students: true
      }
    });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching subjects" });
  }
});

// Obtener materia por ID
router.get("/subjects/:id", async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: {
        id: parseInt(req.params.id)
      },
      include: {
        teacher: true,
        students: true
      }
    });

    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching subject" });
  }
});

// Crear materia
router.post("/subjects", async (req, res) => {
  const { name, year, headquarter, teacherId, studentIds } = req.body;

  try {
    const newSubject = await prisma.subject.create({
      data: {
        name,
        year,
        headquarter,
        teacher: { connect: { id: teacherId } },
        students: {
          connect: studentIds?.map((id) => ({ id }))
        }
      }
    });

    res.status(201).json(newSubject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating subject" });
  }
});

/**
 * PUT update user by id
 */
router.put("/subjects/:id", async (req, res) => {
  try {
    const updatedSubject = await prisma.subject.update({
      where: { 
        id: parseInt(req.params.id) 
      },
      data: req.body,
    });
    res.json(updatedSubject);
  } catch (err) {
    //Cuando no se encuentra al subject devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Subject not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error updating Subject" });
  }
});

/**
 * DELETE user by id
 */
router.delete("/subjects/:id", async (req, res) => {
  try {
    const deletedSubjects = await prisma.subject.delete({
        where: {
            id: parseInt(req.params.id)
        }
    });
    res.json(deletedSubjects);
  } catch (err) {
    //Cuando no se encuentra al user devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "subject not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error deleting subject" });
  }
});

export default router;
