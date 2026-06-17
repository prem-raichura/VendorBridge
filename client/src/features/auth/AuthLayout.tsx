import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background fx */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-odoo-300/40 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-40 -right-20 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl animate-blob" style={{ animationDelay: "-7s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-odoo-700 to-odoo-500 grid place-items-center text-white font-bold shadow-glow">
              VB
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">VendorBridge</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl glass shadow-glow-lg p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-6 pt-6 border-t border-border/50">{footer}</div>}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground mt-6"
        >
          © {new Date().getFullYear()} VendorBridge — Procurement ERP
        </motion.p>
      </div>
    </div>
  );
}
