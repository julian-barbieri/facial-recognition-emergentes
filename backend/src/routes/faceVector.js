import { Router } from "express";
import { prisma } from "../../db.js";

const router = Router();

// Obtener todas las materias
router.get("/facevectors", async (req, res) => {
  try {
    const faceVector = await prisma.faceVector.findMany({
      include: {
        user: true,
      }
    });
    res.json(faceVector);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching Face Vectors" });
  }
});

/**
 * GET /facevectors/:userId
 * Obtener vector facial por ID de usuario
 */
router.get("/facevectors/:userId", async (req, res) => {
  try {
    const faceVector = await prisma.faceVector.findUnique({
      where: {
        userId: parseInt(req.params.userId)
      }
    });

    if (!faceVector) {
      return res.status(404).json({ error: "Face vector not found" });
    }

    res.json(faceVector);
  } catch (err) {
    console.error("Error fetching face vector:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /facevectors/:userId
 * Crear o actualizar vector facial para un usuario
 * body: { descriptor: [...] }
 */
router.post("/facevectors", async (req, res) => {
  const { userId, descriptor } = req.body;

  if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ error: "Invalid descriptor array (128 floats expected)" });
  }

  try {
    const faceVector = await prisma.faceVector.upsert({
      where: { userId: parseInt(userId) },
      update: { descriptor },
      create: {
        userId: parseInt(userId),
        descriptor
      }
    });

    res.status(201).json(faceVector);
  } catch (err) {
    console.error("Error saving face vector:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /facevectors/:userId
 * Eliminar un vector facial por ID de usuario (opcional)
 */
router.delete("/facevectors/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const deleted = await prisma.faceVector.delete({
      where: { userId }
    });

    res.json({ message: "Face vector deleted", data: deleted });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Face vector not found" });
    }

    console.error("Error deleting face vector:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/facevectors/:userId", async (req, res) => {
  try {
    const updatedFaceVector = await prisma.faceVector.update({
      where: { 
        userId: parseInt(req.params.userId) 
      },
      data: req.body,
    });
    res.json(updatedFaceVector);
  } catch (err) {
    //Cuando no se encuentra al FaceVector devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Face Vector not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error updating Face Vector " });
  }
});

export default router;
