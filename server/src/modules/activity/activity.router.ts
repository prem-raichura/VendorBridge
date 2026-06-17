import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as controller from "./activity.controller";

const router = Router();
router.use(requireAuth);
router.get("/", requireRole("ADMIN", "PROCUREMENT_OFFICER", "MANAGER"), controller.listActivity);

export default router;
