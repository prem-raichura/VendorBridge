import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { CreateInvoiceSchema, SendInvoiceEmailSchema, UpdateInvoiceStatusSchema } from "../../shared/schemas";
import * as controller from "./invoices.controller";

const router = Router();
router.use(requireAuth);

router.get("/", controller.listInvoices);
router.post("/", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(CreateInvoiceSchema), controller.createInvoice);
router.get("/:id", controller.getInvoice);
router.get("/:id/pdf", controller.getInvoicePDF);
router.post("/:id/email", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(SendInvoiceEmailSchema), controller.emailInvoice);
router.patch("/:id/status", requireRole("ADMIN"), validate(UpdateInvoiceStatusSchema), controller.updateInvoiceStatus);

export default router;
