import { Router } from "express";
import {
  listEstadoOrden,
  listEstadoPresupuesto,
  listMarcas,
  listAccesorios,
} from "./controller/catalogos.controller.js";

const router = Router();

router.get("/estado-orden", listEstadoOrden);
router.get("/estado-presupuesto", listEstadoPresupuesto);
router.get("/marcas", listMarcas);
router.get("/accesorios", listAccesorios);

export default router;
