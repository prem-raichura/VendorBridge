import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import * as controller from "./reports.controller";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "PROCUREMENT_OFFICER", "MANAGER"));

router.get("/spend", controller.spendReport);
router.get("/vendor-performance", controller.vendorPerformance);
router.get("/monthly", controller.monthlyTrend);

export default router;
