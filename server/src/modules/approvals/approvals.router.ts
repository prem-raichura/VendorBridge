import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { DecideApprovalSchema } from "../../shared/schemas";
import * as controller from "./approvals.controller";

const router = Router();
router.use(requireAuth);

router.get("/pending", requireRole("MANAGER", "ADMIN"), controller.listPending);
router.get("/", requireRole("MANAGER", "ADMIN"), controller.listAll);
router.get("/:id", requireRole("MANAGER", "ADMIN"), controller.getApproval);
router.post("/:id/decide", requireRole("MANAGER", "ADMIN"), validate(DecideApprovalSchema), controller.decide);

export default router;
