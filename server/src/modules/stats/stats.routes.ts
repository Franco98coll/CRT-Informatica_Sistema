import { Router } from "express";
import {
  topMarcas,
  topClientes,
  avgFinalization,
  presupuestoPercent,
  ingresosMensuales,
} from "./controller/stats.controller.js";
import { verifyJWT } from "../auth/middleware/auth.middleware.js";

const router = Router();

// Protect all stats endpoints with JWT
router.use(verifyJWT);

router.get("/top-marcas", topMarcas);
router.get("/top-clientes", topClientes);
router.get("/avg-finalizacion", avgFinalization);
router.get("/presupuesto-percent", presupuestoPercent);
router.get("/ingresos-mensuales", ingresosMensuales);

export default router;
