import { Router } from "express";
import { prisma } from "../../db.js";

const router = Router();

/* GET all users*/
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

/* GET only 1 user*/
router.get("/users/:id", async (req, res) => {
  try {
    const userFound = await prisma.user.findFirst({
        where: {
            id: parseInt(req.params.id)
        }
    });
    if(!userFound){
        res.status(404).json({ error: "user not found" });
    }
    res.json(userFound);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user" });
  }
});


//POST create user
router.post("/users", async (req, res) => {
  try {

    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = await prisma.user.create({
      data: req.body,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
});

/**
 * PUT update user by id
 */
router.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { 
        id: parseInt(req.params.id) 
      },
      data: req.body,
    });
    res.json(updatedUser);
  } catch (err) {
    //Cuando no se encuentra al user devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "user not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error updating user" });
  }
});

/**
 * DELETE user by id
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await prisma.user.delete({
        where: {
            id: parseInt(req.params.id)
        }
    });
    res.json(deletedUser);
  } catch (err) {
    //Cuando no se encuentra al user devuelve err.code === 'P2025'
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "user not found" });
    }
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

export default router;
