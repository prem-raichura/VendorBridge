import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
  country: z.string().optional(),
  role: z.enum(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"]).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

// ─── User ────────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  username: z.string().min(3).max(50).optional(),
  phone: z.string().max(50).nullish(),
  country: z.string().max(100).nullish(),
  bio: z.string().max(500).nullish(),
});

// ─── Vendor ──────────────────────────────────────────────────────────────────

export const CreateVendorSchema = z.object({
  organizationName: z.string().min(1).max(200),
  gstNo: z.string().optional(),
  category: z.string().min(1),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

export const VendorStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// ─── RFQ ─────────────────────────────────────────────────────────────────────

export const RfqItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().positive(),
  unit: z.string().min(1),
  specs: z.string().optional(),
});

export const CreateRfqSchema = z.object({
  title: z.string().min(1).max(300),
  category: z.string().min(1),
  description: z.string().optional(),
  deadline: z.string().datetime(),
  items: z.array(RfqItemSchema).min(1),
  vendorIds: z.array(z.string()).optional(),
});

export const UpdateRfqSchema = CreateRfqSchema.partial().omit({ vendorIds: true });

export const InviteVendorsSchema = z.object({
  vendorIds: z.array(z.string()).min(1),
});

// ─── Quotation ───────────────────────────────────────────────────────────────

export const QuotationItemSchema = z.object({
  rfqItemRef: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  qty: z.number().positive(),
});

export const SubmitQuotationSchema = z.object({
  rfqId: z.string().min(1),
  items: z.array(QuotationItemSchema).min(1),
  gstTax: z.number().min(0).max(100).default(18),
  discount: z.number().min(0).default(0),
  deliveryDays: z.number().positive(),
  paymentTerms: z.string().optional(),
  note: z.string().optional(),
  asDraft: z.boolean().default(false),
});

export const UpdateQuotationSchema = SubmitQuotationSchema.partial().omit({ rfqId: true });

// ─── Approval ────────────────────────────────────────────────────────────────

export const DecideApprovalSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  remarks: z.string().optional(),
});

// ─── Purchase Order ──────────────────────────────────────────────────────────

export const CreatePOSchema = z.object({
  quotationId: z.string().min(1),
});

// ─── Invoice ─────────────────────────────────────────────────────────────────

export const CreateInvoiceSchema = z.object({
  poId: z.string().min(1),
});

export const SendInvoiceEmailSchema = z.object({
  to: z.string().email().optional(),
  cc: z.string().email().optional(),
  message: z.string().optional(),
});

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(["GENERATED", "SENT", "PAID"]),
});

// ─── Enums (mirrored from Prisma for client use) ─────────────────────────────

export const UserRole = z.enum(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"]);
export type UserRole = z.infer<typeof UserRole>;

export const RfqStatus = z.enum(["DRAFT", "SENT", "CLOSED", "CANCELLED"]);
export type RfqStatus = z.infer<typeof RfqStatus>;

export const QuotationStatus = z.enum(["DRAFT", "SUBMITTED", "ACCEPTED", "REJECTED"]);
export type QuotationStatus = z.infer<typeof QuotationStatus>;

export const ApprovalDecision = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type ApprovalDecision = z.infer<typeof ApprovalDecision>;

export const POStatus = z.enum(["DRAFT", "ISSUED", "FULFILLED", "CANCELLED"]);
export type POStatus = z.infer<typeof POStatus>;

export const InvoiceStatus = z.enum(["GENERATED", "SENT", "PAID"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;

export const VendorStatus = z.enum(["ACTIVE", "INACTIVE"]);
export type VendorStatus = z.infer<typeof VendorStatus>;
