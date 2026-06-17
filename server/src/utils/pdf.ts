import PDFDocument from "pdfkit";

interface InvoiceData {
  invoiceNumber: string;
  generatedAt: Date;
  po: {
    poNumber: string;
    vendor: {
      organizationName: string;
      gstNo?: string | null;
      address?: Record<string, string> | null;
    };
  };
  amount: number;
  taxAmount: number;
  totalAmount: number;
  items?: Array<{ name: string; qty: number; unit: string; unitPrice: number }>;
}

export function renderInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("VendorBridge", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#555").text("Procurement & Vendor Management ERP", 50, 78);
    doc.fillColor("#000");

    doc.moveDown(2);

    // Invoice title
    doc.fontSize(18).font("Helvetica-Bold").text(`INVOICE`, { align: "right" });
    doc.fontSize(10).font("Helvetica").text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" });
    doc.text(`Date: ${invoice.generatedAt.toDateString()}`, { align: "right" });
    doc.text(`PO #: ${invoice.po.poNumber}`, { align: "right" });

    doc.moveDown(2);

    // Bill To
    doc.fontSize(11).font("Helvetica-Bold").text("Bill To:");
    doc.fontSize(10).font("Helvetica");
    doc.text(invoice.po.vendor.organizationName);
    if (invoice.po.vendor.gstNo) doc.text(`GST: ${invoice.po.vendor.gstNo}`);
    if (invoice.po.vendor.address) {
      const a = invoice.po.vendor.address;
      const addrLine = [a.street, a.city, a.state, a.pincode, a.country].filter(Boolean).join(", ");
      if (addrLine) doc.text(addrLine);
    }

    doc.moveDown(2);

    // Items table header
    const tableTop = doc.y;
    const col = { item: 50, qty: 280, unit: 330, price: 390, total: 460 };

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Item", col.item, tableTop);
    doc.text("Qty", col.qty, tableTop, { width: 50, align: "right" });
    doc.text("Unit", col.unit, tableTop, { width: 50 });
    doc.text("Unit Price", col.price, tableTop, { width: 70, align: "right" });
    doc.text("Total", col.total, tableTop, { width: 70, align: "right" });

    doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font("Helvetica").fontSize(9);

    const items = invoice.items || [];
    items.forEach((item) => {
      const lineTotal = item.qty * item.unitPrice;
      doc.text(item.name, col.item, y, { width: 220 });
      doc.text(String(item.qty), col.qty, y, { width: 50, align: "right" });
      doc.text(item.unit, col.unit, y, { width: 50 });
      doc.text(`₹${item.unitPrice.toFixed(2)}`, col.price, y, { width: 70, align: "right" });
      doc.text(`₹${lineTotal.toFixed(2)}`, col.total, y, { width: 70, align: "right" });
      y += 20;
    });

    doc.moveTo(50, y).lineTo(530, y).stroke();
    y += 10;

    // Totals
    doc.font("Helvetica").fontSize(10);
    doc.text("Sub Total:", 390, y, { width: 70, align: "right" });
    doc.text(`₹${invoice.amount.toFixed(2)}`, 460, y, { width: 70, align: "right" });
    y += 18;
    doc.text("GST/Tax:", 390, y, { width: 70, align: "right" });
    doc.text(`₹${invoice.taxAmount.toFixed(2)}`, 460, y, { width: 70, align: "right" });
    y += 18;
    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Total:", 390, y, { width: 70, align: "right" });
    doc.text(`₹${invoice.totalAmount.toFixed(2)}`, 460, y, { width: 70, align: "right" });

    // Footer
    doc.moveDown(4);
    doc.fontSize(8).font("Helvetica").fillColor("#777");
    doc.text("Thank you for your business. For queries contact procurement@vendorbridge.local", { align: "center" });

    doc.end();
  });
}
