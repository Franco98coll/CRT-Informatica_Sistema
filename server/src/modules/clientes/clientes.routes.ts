import { Router } from "express";
import { list, search, create } from "./controller/clientes.controller.js";

const router = Router();

router.get("/", list);
router.get("/search", search);
router.post("/", create);

export default router;
