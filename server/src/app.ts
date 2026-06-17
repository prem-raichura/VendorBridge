import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import { env } from "./config/env";
import { errorHandler } from "./middleware/error";

import authRouter from "./modules/auth/auth.router";
import usersRouter from "./modules/users/users.router";
import vendorsRouter from "./modules/vendors/vendors.router";
import rfqsRouter from "./modules/rfqs/rfqs.router";
import quotationsRouter from "./modules/quotations/quotations.router";
import approvalsRouter from "./modules/approvals/approvals.router";
import purchaseOrdersRouter from "./modules/purchaseOrders/purchaseOrders.router";
import invoicesRouter from "./modules/invoices/invoices.router";
import activityRouter from "./modules/activity/activity.router";
import notificationsRouter from "./modules/notifications/notifications.router";
import reportsRouter from "./modules/reports/reports.router";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(env.UPLOADS_DIR)));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/rfqs", rfqsRouter);
app.use("/api/quotations", quotationsRouter);
app.use("/api/approvals", approvalsRouter);
app.use("/api/purchase-orders", purchaseOrdersRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/activity", activityRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reports", reportsRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

export default app;
