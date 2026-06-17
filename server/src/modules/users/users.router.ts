import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validate";
import { UpdateProfileSchema } from "../../shared/schemas";
import * as controller from "./users.controller";

const router = Router();

router.use(requireAuth);
router.get("/me", controller.getMe);
router.patch("/me", validate(UpdateProfileSchema), controller.updateMe);
router.get("/", requireRole("ADMIN"), controller.listUsers);

export default router;
