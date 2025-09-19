import { Router } from "express";
import { getPublicOrden } from "./controller/public.controller.js";

const router = Router();

router.get("/ordenes/:id", getPublicOrden);

export default router;
