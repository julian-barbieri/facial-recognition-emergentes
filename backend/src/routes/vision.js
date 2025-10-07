// backend/routes/vision.js
import { Router } from "express";
import fetch from "node-fetch";
import FormData from "form-data";
import multer from "multer";

const router = Router();

// Multer en memoria + límite (opcional) para evitar fotos gigantes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// URL del microservicio FastAPI
const PY_INFER_URL = process.env.PYTHON_INFER_URL || "http://127.0.0.1:8001/v1/infer/face";
const PY_IDENTITIES_URL = process.env.PYTHON_IDENTITIES_URL || PY_INFER_URL.replace(/\/v1\/infer\/face$/, '/v1/identities');
// Token interno opcional si querés agregar seguridad entre servicios
const PY_BEARER = process.env.PYTHON_INTERNAL_TOKEN || "";

/**
 * POST /api/vision/detect
 * Espera multipart/form-data con field "image"
 */
router.post("/vision/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Falta el archivo 'image' (multipart/form-data)" });

    const form = new FormData();
    form.append("image", req.file.buffer, { filename: req.file.originalname || "frame.jpg" });

    const headers = form.getHeaders();
    if (PY_BEARER) headers["Authorization"] = `Bearer ${PY_BEARER}`;

    const r = await fetch(PY_INFER_URL, {
      method: "POST",
      body: form,
      headers,
      timeout: 15000
    });

    const text = await r.text();
    if (!r.ok) {
      // devolvemos el error del servicio de IA para debug
      return res.status(r.status).json({ error: text });
    }

    // devolvemos el JSON tal cual
    res.type("application/json").send(text);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Servicio de inferencia no disponible" });
  }
});

export default router;

// Listar identidades conocidas (proxy a microservicio)
router.get("/vision/identities", async (_req, res) => {
  try {
    const headers = {};
    if (PY_BEARER) headers["Authorization"] = `Bearer ${PY_BEARER}`;
    const r = await fetch(PY_IDENTITIES_URL, { headers, timeout: 10000 });
    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: text });
    res.type("application/json").send(text);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Servicio de identidades no disponible" });
  }
});
