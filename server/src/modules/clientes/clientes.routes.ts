import { Router } from "express";
import {
  list,
  search,
  create,
  update,
  remove,
} from "./controller/clientes.controller.js";

const router = Router();

router.get("/", list);
router.get("/search", search);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
