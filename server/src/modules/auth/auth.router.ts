import { Router } from "express";
import { validate } from "../../middleware/validate";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../../shared/schemas";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", validate(RegisterSchema), controller.register);
router.post("/login", validate(LoginSchema), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/forgot-password", validate(ForgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", validate(ResetPasswordSchema), controller.resetPassword);

export default router;
