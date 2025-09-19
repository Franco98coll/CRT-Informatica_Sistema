import { Router } from "express";
import { list } from "./controller/presupuestos.controller.js";

const router = Router();

router.get("/", list);

export default router;
