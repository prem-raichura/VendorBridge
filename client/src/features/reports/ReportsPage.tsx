import React from "react";
import { useSpendReport, useVendorPerformance, useMonthlyTrend } from "@/lib/queries/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(d => Object.values(d).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function ReportsPage() {
  const { data: spendData = [], isLoading: spendLoading } = useSpendReport();
  const { data: perfData = [], isLoading: perfLoading } = useVendorPerformance();
  const { data: monthlyData = [], isLoading: monthlyLoading } = useMonthlyTrend();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Procurement insights and trends</p>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Monthly Procurement Spend</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportCSV(monthlyData as Record<string, unknown>[], "monthly-trend.csv")}><Download size={12} /> Export</Button>
        </CardHeader>
        <CardContent>
          {monthlyLoading ? <Skeleton className="h-[250px] w-full" /> :
            (monthlyData as []).length === 0 ? <p className="text-muted-foreground text-sm text-center py-8">No data yet</p> :
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData as Array<{ month: string; total: number }>}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          }
        </CardContent>
      </Card>

      {/* Spend by Vendor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Spend by Vendor</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportCSV(spendData as Record<string, unknown>[], "spend-report.csv")}><Download size={12} /> Export</Button>
        </CardHeader>
        <CardContent>
          {spendLoading ? <Skeleton className="h-[250px] w-full" /> :
            (spendData as []).length === 0 ? <p className="text-muted-foreground text-sm text-center py-8">No data yet</p> :
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(spendData as Array<{ vendor: string; total: number }>).slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          }
        </CardContent>
      </Card>

      {/* Vendor Performance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vendor Performance</CardTitle>
          <Button size="sm" variant="outline" onClick={() => exportCSV(perfData as Record<string, unknown>[], "vendor-performance.csv")}><Download size={12} /> Export</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {perfLoading && <TableSkeleton rows={6} cols={8} />}
          {!perfLoading && <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-muted-foreground">
                <th className="text-left py-2">Vendor</th>
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Quotes</th>
                <th className="text-right py-2">Accepted</th>
                <th className="text-right py-2">Orders</th>
                <th className="text-right py-2">Total Spend</th>
                <th className="text-right py-2">Avg Delivery</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(perfData as Array<{
                id: string; organizationName: string; category: string; totalQuotations: number;
                acceptedQuotations: number; totalOrders: number; totalSpend: number; avgDeliveryDays: number; status: string; rating?: number
              }>).map(v => (
                <tr key={v.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{v.organizationName}</td>
                  <td className="py-2 text-muted-foreground">{v.category}</td>
                  <td className="py-2 text-right">{v.totalQuotations}</td>
                  <td className="py-2 text-right text-green-600">{v.acceptedQuotations}</td>
                  <td className="py-2 text-right">{v.totalOrders}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(v.totalSpend)}</td>
                  <td className="py-2 text-right">{v.avgDeliveryDays}d</td>
                  <td className="py-2 text-center"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>}
          {!perfLoading && (perfData as []).length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No vendor data yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
