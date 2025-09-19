import { Router } from "express";
import * as controller from "./controller/users.controller.js";
import { verifyJWT } from "../auth/middleware/auth.middleware.js";
import { setUserPassword } from "./service/users.service.js";

const router = Router();

router.get("/", controller.getAll);

// Actualizar contraseña (hash bcrypt). Requiere JWT.
router.post("/:id/password", verifyJWT, async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body || {};
  if (!id || Number.isNaN(id))
    return res.status(400).json({ message: "id inválido" });
  if (!password || String(password).length < 6)
    return res.status(400).json({ message: "password inválido (min 6)" });
  try {
    await setUserPassword(id, String(password));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Error" });
  }
});

export default router;
