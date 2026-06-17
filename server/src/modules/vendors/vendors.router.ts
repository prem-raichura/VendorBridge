import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { CreateVendorSchema, UpdateVendorSchema, VendorStatusSchema } from "../../shared/schemas";
import * as controller from "./vendors.controller";

const router = Router();
router.use(requireAuth);

router.get("/", controller.listVendors);
router.post("/", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(CreateVendorSchema), controller.createVendor);
router.get("/:id", controller.getVendor);
router.patch("/:id", requireRole("ADMIN", "PROCUREMENT_OFFICER"), validate(UpdateVendorSchema), controller.updateVendor);
router.delete("/:id", requireRole("ADMIN"), controller.deleteVendor);
router.patch("/:id/status", requireRole("ADMIN"), validate(VendorStatusSchema), controller.toggleVendorStatus);

export default router;
