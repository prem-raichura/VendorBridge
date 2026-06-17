import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  console.log("Seeding database...");

  const hash = (p: string) => bcrypt.hash(p, 12);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@vendorbridge.com" },
    update: {},
    create: { firstName: "Super", lastName: "Admin", username: "admin", email: "admin@vendorbridge.com", passwordHash: await hash("Admin@1234"), role: "ADMIN" },
  });

  const po1 = await prisma.user.upsert({
    where: { email: "officer@vendorbridge.com" },
    update: {},
    create: { firstName: "Priya", lastName: "Mehta", username: "priya.po", email: "officer@vendorbridge.com", passwordHash: await hash("Officer@1234"), role: "PROCUREMENT_OFFICER" },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@vendorbridge.com" },
    update: {},
    create: { firstName: "Rahul", lastName: "Sharma", username: "rahul.mgr", email: "manager@vendorbridge.com", passwordHash: await hash("Manager@1234"), role: "MANAGER" },
  });

  const v1user = await prisma.user.upsert({
    where: { email: "vendor1@acme.com" },
    update: {},
    create: { firstName: "Acme", lastName: "Corp", username: "acme_corp", email: "vendor1@acme.com", passwordHash: await hash("Vendor@1234"), role: "VENDOR" },
  });
  const v2user = await prisma.user.upsert({
    where: { email: "vendor2@techsup.com" },
    update: {},
    create: { firstName: "TechSup", lastName: "Pvt", username: "techsup", email: "vendor2@techsup.com", passwordHash: await hash("Vendor@1234"), role: "VENDOR" },
  });
  const v3user = await prisma.user.upsert({
    where: { email: "vendor3@globalit.com" },
    update: {},
    create: { firstName: "Global", lastName: "IT", username: "global_it", email: "vendor3@globalit.com", passwordHash: await hash("Vendor@1234"), role: "VENDOR" },
  });

  // Vendor profiles
  const vendor1 = await prisma.vendor.upsert({
    where: { userId: v1user.id },
    update: {},
    create: { userId: v1user.id, organizationName: "Acme Corp Pvt Ltd", gstNo: "27AABCU9603R1ZX", category: "IT Hardware", address: { street: "12 MG Road", city: "Mumbai", state: "Maharashtra", pincode: "400001", country: "India" }, status: "ACTIVE", rating: 4.5 },
  });
  const vendor2 = await prisma.vendor.upsert({
    where: { userId: v2user.id },
    update: {},
    create: { userId: v2user.id, organizationName: "TechSup Solutions Pvt Ltd", gstNo: "29AAKFT0283B1ZX", category: "Software", address: { street: "5 Koramangala", city: "Bengaluru", state: "Karnataka", pincode: "560034", country: "India" }, status: "ACTIVE", rating: 3.8 },
  });
  const vendor3 = await prisma.vendor.upsert({
    where: { userId: v3user.id },
    update: {},
    create: { userId: v3user.id, organizationName: "Global IT Services", gstNo: "07AADCG0012A1ZX", category: "IT Hardware", address: { street: "A-41 Connaught Place", city: "New Delhi", state: "Delhi", pincode: "110001", country: "India" }, status: "ACTIVE", rating: 4.2 },
  });

  // Sample RFQ
  const rfq = await prisma.rfq.upsert({
    where: { id: "seed-rfq-001" },
    update: {},
    create: {
      id: "seed-rfq-001",
      title: "Procurement of Laptops and Accessories Q3 2026",
      category: "IT Hardware",
      description: "We require 50 laptops with accessories for office use.",
      deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      items: [
        { name: "Laptop 16GB RAM 512SSD", qty: 50, unit: "pcs", specs: "Core i7, 16GB DDR5, 512GB SSD" },
        { name: "Wireless Mouse", qty: 50, unit: "pcs", specs: "Ergonomic, Bluetooth" },
        { name: "Laptop Bag", qty: 50, unit: "pcs", specs: "15.6 inch compatible" },
      ],
      createdById: po1.id,
      status: "SENT",
    },
  });

  // Invite vendors
  await prisma.rfqVendor.createMany({
    data: [{ rfqId: rfq.id, vendorId: vendor1.id }, { rfqId: rfq.id, vendorId: vendor2.id }, { rfqId: rfq.id, vendorId: vendor3.id }],
    skipDuplicates: true,
  });

  // Quotations
  const q1 = await prisma.quotation.upsert({
    where: { rfqId_vendorId: { rfqId: rfq.id, vendorId: vendor1.id } },
    update: {},
    create: {
      rfqId: rfq.id, vendorId: vendor1.id,
      items: [{ rfqItemRef: "Laptop 16GB RAM 512SSD", unitPrice: 75000, qty: 50 }, { rfqItemRef: "Wireless Mouse", unitPrice: 1200, qty: 50 }, { rfqItemRef: "Laptop Bag", unitPrice: 800, qty: 50 }],
      subAmount: 3850000, gstTax: 18, discount: 5, totalAmount: 4298100,
      deliveryDays: 14, paymentTerms: "Net 30", note: "Bulk discount applied", status: "SUBMITTED", submittedAt: new Date(),
    },
  });

  await prisma.quotation.upsert({
    where: { rfqId_vendorId: { rfqId: rfq.id, vendorId: vendor2.id } },
    update: {},
    create: {
      rfqId: rfq.id, vendorId: vendor2.id,
      items: [{ rfqItemRef: "Laptop 16GB RAM 512SSD", unitPrice: 72000, qty: 50 }, { rfqItemRef: "Wireless Mouse", unitPrice: 1100, qty: 50 }, { rfqItemRef: "Laptop Bag", unitPrice: 750, qty: 50 }],
      subAmount: 3692500, gstTax: 18, discount: 0, totalAmount: 4357150,
      deliveryDays: 21, paymentTerms: "Net 45", status: "SUBMITTED", submittedAt: new Date(),
    },
  });

  await prisma.quotation.upsert({
    where: { rfqId_vendorId: { rfqId: rfq.id, vendorId: vendor3.id } },
    update: {},
    create: {
      rfqId: rfq.id, vendorId: vendor3.id,
      items: [{ rfqItemRef: "Laptop 16GB RAM 512SSD", unitPrice: 76000, qty: 50 }, { rfqItemRef: "Wireless Mouse", unitPrice: 1300, qty: 50 }, { rfqItemRef: "Laptop Bag", unitPrice: 900, qty: 50 }],
      subAmount: 3910000, gstTax: 18, discount: 3, totalAmount: 4477542,
      deliveryDays: 10, paymentTerms: "Net 15", note: "Fastest delivery", status: "SUBMITTED", submittedAt: new Date(),
    },
  });

  // Approval + PO + Invoice for q1
  const approval = await prisma.approval.upsert({
    where: { quotationId: q1.id },
    update: {},
    create: { quotationId: q1.id, approverId: manager.id, decision: "APPROVED", remarks: "Best value for money", decidedAt: new Date() },
  });

  const po = await prisma.purchaseOrder.upsert({
    where: { quotationId: q1.id },
    update: {},
    create: { poNumber: "PO-2026-000001", quotationId: q1.id, vendorId: vendor1.id, createdById: po1.id, totalAmount: q1.totalAmount, status: "ISSUED" },
  });

  await prisma.invoice.upsert({
    where: { poId: po.id },
    update: {},
    create: { invoiceNumber: "INV-2026-000001", poId: po.id, amount: q1.subAmount, taxAmount: q1.subAmount * 0.18, totalAmount: q1.totalAmount, status: "GENERATED" },
  });

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      { userId: po1.id, action: "CREATED_RFQ", entityType: "RFQ", entityId: rfq.id },
      { userId: po1.id, action: "INVITED_VENDORS", entityType: "RFQ", entityId: rfq.id, metadata: { count: 3 } },
      { userId: manager.id, action: "APPROVED_QUOTATION_PO_CREATED", entityType: "PO", entityId: approval.id },
      { userId: po1.id, action: "GENERATED_INVOICE", entityType: "INVOICE", entityId: po.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete!");
  console.log("Login credentials:");
  console.log("  Admin:    admin@vendorbridge.com / Admin@1234");
  console.log("  Officer:  officer@vendorbridge.com / Officer@1234");
  console.log("  Manager:  manager@vendorbridge.com / Manager@1234");
  console.log("  Vendor 1: vendor1@acme.com / Vendor@1234");
  console.log("  Vendor 2: vendor2@techsup.com / Vendor@1234");
  console.log("  Vendor 3: vendor3@globalit.com / Vendor@1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
