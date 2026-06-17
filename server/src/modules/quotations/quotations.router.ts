import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { SubmitQuotationSchema, UpdateQuotationSchema } from "../../shared/schemas";
import * as controller from "./quotations.controller";

const router = Router();
router.use(requireAuth);

router.get("/", controller.listQuotations);
router.post("/", requireRole("VENDOR"), validate(SubmitQuotationSchema), controller.createQuotation);
router.get("/:id", controller.getQuotation);
router.patch("/:id", requireRole("VENDOR"), validate(UpdateQuotationSchema), controller.updateQuotation);
router.post("/:id/accept", requireRole("ADMIN", "PROCUREMENT_OFFICER"), controller.acceptQuotation);
router.post("/:id/reject", requireRole("ADMIN", "PROCUREMENT_OFFICER"), controller.rejectQuotation);

export default router;
