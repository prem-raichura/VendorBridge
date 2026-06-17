import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./purchaseOrders.controller";

const router = Router();
router.use(requireAuth);

router.get("/", controller.listPOs);
router.get("/:id", controller.getPO);

export default router;
