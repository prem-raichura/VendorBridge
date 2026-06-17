import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/passwords";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/tokens";
import { sendPasswordResetEmail } from "../../utils/mailer";
import { env } from "../../config/env";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { firstName, lastName, username, email, password, phone, country, role } = req.body;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) { res.status(409).json({ message: "Email or username already exists" }); return; }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { firstName, lastName, username, email, passwordHash, phone, country, role: role ?? "PROCUREMENT_OFFICER" },
    });

    if (user.role === "VENDOR") {
      await prisma.vendor.create({
        data: { userId: user.id, organizationName: `${firstName} ${lastName}`, category: "General" },
      });
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000, sameSite: "lax" });
    res.status(201).json({ accessToken, user: { id: user.id, role: user.role, firstName, lastName, email } });
  } catch (e) { next(e); }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid credentials" }); return;
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: env.NODE_ENV === "production", maxAge: 7 * 24 * 3600 * 1000, sameSite: "lax" });
    res.json({ accessToken, user: { id: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (e) { next(e); }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) { res.status(401).json({ message: "No refresh token" }); return; }
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ id: payload.id, role: payload.role });
    res.json({ accessToken });
  } catch { res.status(401).json({ message: "Refresh token invalid" }); }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.json({ message: "If email exists, reset link sent" }); return; }
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: expiry } });
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (mailErr) {
      // Email delivery failure must not leak user existence or 500 the request.
      // Token is already persisted; user can be informed out-of-band if SMTP is misconfigured.
      console.error("[forgotPassword] mailer failed:", mailErr);
    }
    res.json({ message: "If email exists, reset link sent" });
  } catch (e) { next(e); }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) { res.status(400).json({ message: "Invalid or expired token" }); return; }
    const passwordHash = await hashPassword(password);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExpiry: null } });
    res.json({ message: "Password reset successful" });
  } catch (e) { next(e); }
}
