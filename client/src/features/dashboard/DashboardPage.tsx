import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { useRfqs } from "@/lib/queries/rfqs";
import { usePendingApprovals } from "@/lib/queries/approvals";
import { usePurchaseOrders } from "@/lib/queries/purchaseOrders";
import { useInvoices } from "@/lib/queries/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCardsSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  FileText, Building2, ShoppingCart, Receipt, Plus, CheckSquare, TrendingUp, ArrowRight, Sparkles,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: rfqs = [], isLoading: rfqsLoading } = useRfqs({ status: "SENT" });
  const { data: pendingApprovals = [], isLoading: appLoading } = usePendingApprovals();
  const { data: pos = [], isLoading: posLoading } = usePurchaseOrders();
  const { data: invoices = [], isLoading: invLoading } = useInvoices();

  const isVendor = user?.role === "VENDOR";
  const isManager = user?.role === "MANAGER";
  const isPO = user?.role === "PROCUREMENT_OFFICER";
  const isAdmin = user?.role === "ADMIN";

  const posArray = pos as Array<{ id: string; poNumber: string; status: string; totalAmount: number; createdAt: string; vendor: { organizationName: string } }>;
  const totalSpend = posArray.reduce((s, p) => s + p.totalAmount, 0);
  const loadingStats = rfqsLoading || appLoading || posLoading || invLoading;

  const spendByVendor = useMemo(() => {
    const map = new Map<string, number>();
    posArray.forEach(po => {
      const name = po.vendor?.organizationName || "Unknown";
      map.set(name, (map.get(name) || 0) + po.totalAmount);
    });
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [posArray]);

  const spendOverTime = useMemo(() => {
    const aggregated = posArray.reduce((acc: Record<string, number>, po) => {
      const d = new Date(po.createdAt).toISOString().split("T")[0];
      acc[d] = (acc[d] || 0) + po.totalAmount;
      return acc;
    }, {});
    return Object.entries(aggregated)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        total
      }));
  }, [posArray]);

  const stats: Array<{ show: boolean; label: string; value: string | number; icon: React.ReactNode; color: string; route: string }> = [
    { show: isPO || isAdmin, label: "Active RFQs", value: rfqs.length, icon: <FileText size={18} />, color: "from-blue-500 to-cyan-500", route: "/app/rfqs" },
    { show: isManager || isAdmin, label: "Pending Approvals", value: (pendingApprovals as []).length, icon: <CheckSquare size={18} />, color: "from-amber-500 to-orange-500", route: "/app/approvals" },
    { show: true, label: "Purchase Orders", value: posArray.length, icon: <ShoppingCart size={18} />, color: "from-emerald-500 to-teal-500", route: "/app/purchase-orders" },
    { show: true, label: "Total Spend", value: formatCurrency(totalSpend), icon: <TrendingUp size={18} />, color: "from-violet-500 to-fuchsia-500", route: "/app/reports" },
  ];
  const visibleStats = stats.filter(s => s.show);

  return (
    <div className="space-y-7">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-odoo-700 via-odoo-600 to-odoo-500 p-7 text-white shadow-glow-lg">
        <div className="absolute inset-0 noise opacity-[0.06]" />
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium mb-3">
            <Sparkles size={12} /> {user?.role?.replace(/_/g, " ")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {user?.firstName} 👋</h1>
          <p className="text-white/75 text-sm mt-1.5">Here's what's happening in your procurement workflow today.</p>
        </div>
      </div>

      {loadingStats ? (
        <StatCardsSkeleton count={visibleStats.length} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                className="cursor-pointer hover:shadow-soft hover:border-primary/30 transition-all group"
                onClick={() => navigate(s.route)}
              >
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      {s.icon}
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{s.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {!loadingStats && spendOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis tickFormatter={(val) => `$${val}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), "Spend"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                {loadingStats ? "Loading chart data..." : "Not enough data to display"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Vendors by Spend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {!loadingStats && spendByVendor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendByVendor} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <XAxis type="number" tickFormatter={(val) => `$${val}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    formatter={(value: number) => [formatCurrency(value), "Spend"]}
                  />
                  <Bar dataKey="total" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                {loadingStats ? "Loading chart data..." : "Not enough data to display"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2.5">
          {(isPO || isAdmin) && (
            <>
              <Button variant="gradient" size="sm" onClick={() => navigate("/app/rfqs/new")}><Plus size={14} /> New RFQ</Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/app/vendors/new")}><Building2 size={14} /> Add Vendor</Button>
            </>
          )}
          {isVendor && (
            <Button variant="gradient" size="sm" onClick={() => navigate("/app/rfqs")}><FileText size={14} /> Open RFQs</Button>
          )}
          {isManager && (
            <Button variant="gradient" size="sm" onClick={() => navigate("/app/approvals")}><CheckSquare size={14} /> Review Approvals</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => navigate("/app/purchase-orders")}><ShoppingCart size={14} /> Purchase Orders</Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/app/invoices")}><Receipt size={14} /> Invoices</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent purchase orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/purchase-orders")}>
              View all <ArrowRight size={12} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {posArray.slice(0, 5).map(po => (
              <div
                key={po.id}
                className="flex items-center justify-between py-2.5 px-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors"
                onClick={() => navigate(`/app/purchase-orders/${po.id}`)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium tabular-nums">{po.poNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{po.vendor?.organizationName}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={po.status} />
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">{formatCurrency(po.totalAmount)}</p>
                </div>
              </div>
            ))}
            {!posLoading && posArray.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No purchase orders yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/invoices")}>
              View all <ArrowRight size={12} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {(invoices as Array<{ id: string; invoiceNumber: string; status: string; totalAmount: number; generatedAt: string }>).slice(0, 5).map(inv => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-2.5 px-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors"
                onClick={() => navigate(`/app/invoices/${inv.id}`)}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium tabular-nums">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inv.generatedAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={inv.status} />
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">{formatCurrency(inv.totalAmount)}</p>
                </div>
              </div>
            ))}
            {!invLoading && (invoices as []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
