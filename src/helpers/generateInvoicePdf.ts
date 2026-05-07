import type { CompanyRow } from "@/types/companies.types";
import type { PaymentRow } from "@/types/payments.types";
import jsPDF from "jspdf";

// ─── Samvan Technologies / WBI seller details ────────────────────────────────

const SELLER = {
  company: "Samvan Technologies",
  app: "WBI",
  addressLines: [
    "4-48, SC Colony",
    "Muthampet, Koutala",
    "Kumuram Bheem Asifabad",
    "Telangana 504299",
    "India"
  ],
  email: "support@wbi.com"
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function invoiceNumber(payment: PaymentRow): string {
  return `INV-${payment.id.slice(-8).toUpperCase()}`;
}

function paymentTypeLabel(type: string): string {
  return type === "message_credits" ? "Message Credits Purchase" : "Subscription Payment";
}

// ─── Drawing primitives ───────────────────────────────────────────────────────

function hLine(doc: jsPDF, y: number, x1 = 14, x2 = 196, color = "#E0E0E0"): void {
  doc.setDrawColor(color);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
}

function setFont(doc: jsPDF, style: "normal" | "bold", size: number, color = "#1A1A2E"): void {
  doc.setFont("helvetica", style);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

function label(doc: jsPDF, text: string, x: number, y: number): void {
  setFont(doc, "bold", 7, "#8B8FA8");
  doc.text(text.toUpperCase(), x, y);
}

function value(doc: jsPDF, text: string, x: number, y: number, color = "#1A1A2E"): void {
  setFont(doc, "normal", 9, color);
  doc.text(text, x, y);
}

function boldValue(doc: jsPDF, text: string, x: number, y: number, color = "#1A1A2E"): void {
  setFont(doc, "bold", 9, color);
  doc.text(text, x, y);
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function generateInvoicePdf(payment: PaymentRow, company: CompanyRow): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const W = doc.internal.pageSize.getWidth();
  const margin = 14;
  const rightCol = 120;
  const invoiceDate = fmtDate(payment.paidAt ?? payment.createdAt);
  const invNum = invoiceNumber(payment);

  // ── Header band ────────────────────────────────────────────────────────────

  // Accent bar at top
  doc.setFillColor("#075E54");
  doc.rect(0, 0, W, 12, "F");

  // App name in bar
  setFont(doc, "bold", 13, "#FFFFFF");
  doc.text(SELLER.app, margin, 8.5);

  // "PAYMENT RECEIPT" on right
  setFont(doc, "bold", 9, "#A7F3D0");
  doc.text("PAYMENT RECEIPT", W - margin, 8.5, { align: "right" });

  // ── Company name & tagline ─────────────────────────────────────────────────

  let y = 22;
  setFont(doc, "bold", 16, "#1A1A2E");
  doc.text(SELLER.company, margin, y);

  y += 5;
  setFont(doc, "normal", 8.5, "#6B7280");
  doc.text("Technology Solutions", margin, y);

  // Invoice number badge (right side)
  doc.setFillColor("#F0FDF4");
  doc.setDrawColor("#075E54");
  doc.setLineWidth(0.4);
  doc.roundedRect(W - margin - 60, 16, 60, 14, 2, 2, "FD");

  setFont(doc, "bold", 7, "#065F46");
  doc.text("INVOICE NUMBER", W - margin - 30, 21.5, { align: "center" });
  setFont(doc, "bold", 10, "#065F46");
  doc.text(invNum, W - margin - 30, 27, { align: "center" });

  // ── Divider ────────────────────────────────────────────────────────────────

  y = 36;
  hLine(doc, y, margin, W - margin, "#075E54");

  // ── Two-column section: BILLED FROM | INVOICE DETAILS ─────────────────────

  y += 7;
  label(doc, "Billed From", margin, y);
  label(doc, "Invoice Details", rightCol, y);

  y += 5;
  boldValue(doc, SELLER.company, margin, y);
  label(doc, "Date", rightCol, y - 0.5);
  y += 1;
  value(doc, invoiceDate, rightCol, y + 3.5);
  y += 4;

  for (const line of SELLER.addressLines) {
    value(doc, line, margin, y);
    y += 4.5;
  }

  value(doc, SELLER.email, margin, y);

  // Invoice details column
  let dy = 45;
  label(doc, "Payment Date", rightCol, dy);
  dy += 4.5;
  value(doc, invoiceDate, rightCol, dy);

  dy += 7;
  label(doc, "Status", rightCol, dy);
  dy += 4.5;
  const isPaid = payment.status === "captured";
  boldValue(
    doc,
    isPaid ? "PAID" : payment.status.toUpperCase(),
    rightCol,
    dy,
    isPaid ? "#059669" : "#DC2626"
  );

  dy += 7;
  label(doc, "Payment Method", rightCol, dy);
  dy += 4.5;
  value(doc, payment.paymentMethod ?? "—", rightCol, dy);

  if (payment.razorpayOrderId) {
    dy += 7;
    label(doc, "Order Reference", rightCol, dy);
    dy += 4.5;
    setFont(doc, "normal", 7.5, "#6B7280");
    doc.text(payment.razorpayOrderId, rightCol, dy);
  }

  if (payment.razorpayPaymentId) {
    dy += 7;
    label(doc, "Payment ID", rightCol, dy);
    dy += 4.5;
    setFont(doc, "normal", 7.5, "#6B7280");
    doc.text(payment.razorpayPaymentId, rightCol, dy);
  }

  // ── Divider ────────────────────────────────────────────────────────────────

  y = Math.max(y + 8, dy + 10);
  hLine(doc, y, margin, W - margin);

  // ── BILLED TO ─────────────────────────────────────────────────────────────

  y += 7;
  label(doc, "Billed To", margin, y);
  y += 5;
  boldValue(doc, company.name, margin, y);
  y += 5;
  if (company.address) {
    value(doc, company.address, margin, y);
    y += 4.5;
  }
  const cityLine = [company.city, company.state, company.zipcode].filter(Boolean).join(", ");
  if (cityLine) {
    value(doc, cityLine, margin, y);
    y += 4.5;
  }
  if (company.country) {
    value(doc, company.country, margin, y);
    y += 4.5;
  }
  if (company.phone) {
    value(doc, company.phone, margin, y);
    y += 4.5;
  }
  if (company.email) {
    value(doc, company.email, margin, y);
    y += 4.5;
  }

  // ── Line items table ───────────────────────────────────────────────────────

  y += 4;
  hLine(doc, y, margin, W - margin);
  y += 1;

  // Table header
  doc.setFillColor("#F8FFFE");
  doc.rect(margin, y, W - margin * 2, 9, "F");

  y += 6.5;
  setFont(doc, "bold", 7.5, "#374151");
  doc.text("DESCRIPTION", margin + 3, y);
  doc.text("QTY", 138, y, { align: "right" });
  doc.text("UNIT PRICE", 165, y, { align: "right" });
  doc.text("TOTAL", W - margin - 2, y, { align: "right" });

  y += 2;
  hLine(doc, y, margin, W - margin, "#D1FAE5");

  // Row
  y += 7;
  setFont(doc, "normal", 9, "#1A1A2E");
  doc.text(paymentTypeLabel(payment.type), margin + 3, y);
  setFont(doc, "normal", 9, "#6B7280");
  doc.text("1", 138, y, { align: "right" });
  doc.text(fmt(payment.amount, payment.currency), 165, y, { align: "right" });
  setFont(doc, "bold", 9, "#1A1A2E");
  doc.text(fmt(payment.amount, payment.currency), W - margin - 2, y, { align: "right" });

  y += 4;
  hLine(doc, y, margin, W - margin, "#E5E7EB");

  // ── Totals block ───────────────────────────────────────────────────────────

  y += 6;
  const totalBoxX = W - margin - 75;
  const totalBoxW = 75;

  // Subtotal
  setFont(doc, "normal", 8.5, "#6B7280");
  doc.text("Subtotal", totalBoxX, y);
  setFont(doc, "normal", 8.5, "#1A1A2E");
  doc.text(fmt(payment.amount, payment.currency), W - margin - 2, y, { align: "right" });

  y += 6;
  setFont(doc, "normal", 8.5, "#6B7280");
  doc.text("Tax", totalBoxX, y);
  setFont(doc, "normal", 8.5, "#1A1A2E");
  doc.text("—", W - margin - 2, y, { align: "right" });

  y += 3;
  hLine(doc, y, totalBoxX, W - margin, "#E5E7EB");
  y += 5;

  // Total band
  doc.setFillColor("#075E54");
  doc.rect(totalBoxX - 2, y - 4, totalBoxW + 4, 11, "F");
  setFont(doc, "bold", 9, "#FFFFFF");
  doc.text("TOTAL", totalBoxX + 1, y + 3);
  setFont(doc, "bold", 11, "#FFFFFF");
  doc.text(fmt(payment.amount, payment.currency), W - margin - 2, y + 3, { align: "right" });

  // ── Footer ─────────────────────────────────────────────────────────────────

  const footerY = 275;
  hLine(doc, footerY, margin, W - margin, "#D1FAE5");

  setFont(doc, "normal", 8, "#6B7280");
  doc.text("Thank you for your business!", margin, footerY + 6);
  doc.text(`${SELLER.company} · ${SELLER.email}`, W - margin, footerY + 6, { align: "right" });

  setFont(doc, "normal", 7, "#9CA3AF");
  doc.text(
    "This is a computer-generated document. No signature is required.",
    W / 2,
    footerY + 12,
    { align: "center" }
  );

  // ── Save ────────────────────────────────────────────────────────────────────

  doc.save(`${invNum}.pdf`);
}
