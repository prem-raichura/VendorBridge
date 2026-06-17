import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";

import { LandingPage } from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { SignupPage } from "@/features/auth/SignupPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";

import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { VendorListPage } from "@/features/vendors/VendorListPage";
import { VendorFormPage } from "@/features/vendors/VendorFormPage";
import { VendorDetailPage } from "@/features/vendors/VendorDetailPage";
import { RfqListPage } from "@/features/rfqs/RfqListPage";
import { RfqCreatePage } from "@/features/rfqs/RfqCreatePage";
import { RfqDetailPage } from "@/features/rfqs/RfqDetailPage";
import { QuotationComparePage } from "@/features/compare/QuotationComparePage";
import { QuotationListPage } from "@/features/quotations/QuotationListPage";
import { QuotationSubmitPage } from "@/features/quotations/QuotationSubmitPage";
import { QuotationDetailPage } from "@/features/quotations/QuotationDetailPage";
import { ApprovalQueuePage } from "@/features/approvals/ApprovalQueuePage";
import { ApprovalDetailPage } from "@/features/approvals/ApprovalDetailPage";
import { POListPage } from "@/features/purchase-orders/POListPage";
import { PODetailPage } from "@/features/purchase-orders/PODetailPage";
import { InvoiceListPage } from "@/features/invoices/InvoiceListPage";
import { InvoiceDetailPage } from "@/features/invoices/InvoiceDetailPage";
import { ActivityTimelinePage } from "@/features/activity/ActivityTimelinePage";
import { NotificationsPage } from "@/features/notifications/NotificationsPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ProfilePage } from "@/features/settings/ProfilePage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AppRouter() {
  const user = useAuthStore((s) => s.user);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/app/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/app/dashboard" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vendors" element={<VendorListPage />} />
          <Route path="vendors/new" element={<VendorFormPage />} />
          <Route path="vendors/:id" element={<VendorDetailPage />} />
          <Route path="rfqs" element={<RfqListPage />} />
          <Route path="rfqs/new" element={<RfqCreatePage />} />
          <Route path="rfqs/:id" element={<RfqDetailPage />} />
          <Route path="rfqs/:id/compare" element={<QuotationComparePage />} />
          <Route path="quotations" element={<QuotationListPage />} />
          <Route path="quotations/new" element={<QuotationSubmitPage />} />
          <Route path="quotations/:id" element={<QuotationDetailPage />} />
          <Route path="approvals" element={<ApprovalQueuePage />} />
          <Route path="approvals/:id" element={<ApprovalDetailPage />} />
          <Route path="purchase-orders" element={<POListPage />} />
          <Route path="purchase-orders/:id" element={<PODetailPage />} />
          <Route path="invoices" element={<InvoiceListPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="activity" element={<ActivityTimelinePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings/profile" element={<ProfilePage />} />
        </Route>

        {/* Legacy routes redirect to /app */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
