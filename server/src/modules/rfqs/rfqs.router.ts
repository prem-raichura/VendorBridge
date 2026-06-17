import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { CreateRfqSchema, UpdateRfqSchema, InviteVendorsSchema } from "../../shared/schemas";
import * as controller from "./rfqs.controller";

const router = Router();
router.use(requireAuth);

router.get("/", controller.listRfqs);
router.post("/", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(CreateRfqSchema), controller.createRfq);
router.get("/:id", controller.getRfq);
router.patch("/:id", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(UpdateRfqSchema), controller.updateRfq);
router.delete("/:id", requireRole("ADMIN", "PROCUREMENT_OFFICER"), controller.deleteRfq);
router.post("/:id/invite", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(InviteVendorsSchema), controller.inviteVendors);
router.post("/:id/close", requireRole("ADMIN", "PROCUREMENT_OFFICER"), controller.closeRfq);
router.get("/:id/quotations", controller.getRfqQuotations);

export default router;
