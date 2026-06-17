import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendInvoiceEmail(opts: {
  to: string;
  cc?: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
  message?: string;
}) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: opts.to,
    cc: opts.cc,
    subject: `Invoice ${opts.invoiceNumber} from VendorBridge`,
    text: opts.message || `Please find attached invoice ${opts.invoiceNumber}.`,
    attachments: [
      {
        filename: `${opts.invoiceNumber}.pdf`,
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "VendorBridge — Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
}
