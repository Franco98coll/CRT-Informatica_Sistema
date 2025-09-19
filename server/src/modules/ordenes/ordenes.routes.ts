import { Router } from "express";
import { list } from "./controller/ordenes.controller.js";
import { create } from "./controller/ordenes.ext.controller.js";
import {
  listFull,
  getDetail,
  update,
} from "./controller/ordenes.manage.controller.js";

const router = Router();

router.get("/", list);
router.post("/", create);
router.get("/full", listFull);
router.get("/:id", getDetail);
router.put("/:id", update);

export default router;
