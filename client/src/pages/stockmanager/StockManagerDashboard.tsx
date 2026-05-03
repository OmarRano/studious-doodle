import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, XCircle, TrendingDown, ArrowRight, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// ─── Demo mock (used when tRPC not connected) ─────────────────────────────────
const MOCK_SUMMARY = { totalProducts: 142, lowStockProducts: 12, outOfStockProducts: 3 };
const MOCK_LOW_STOCK = [
  { _id: "1", name: "Indomie Noodles (Carton)",  stockQuantity: 4,  categoryId: { name: "Food & Groceries" } },
  { _id: "2", name: "Bic Ballpoint Pens (Pack)", stockQuantity: 7,  categoryId: { name: "Stationery" } },
  { _id: "3", name: "Dettol Soap (12-pack)",     stockQuantity: 2,  categoryId: { name: "Health & Beauty" } },
  { _id: "4", name: "Peak Milk (48-pack)",        stockQuantity: 0,  categoryId: { name: "Dairy" } },
  { _id: "5", name: "Sunlight Detergent 1kg",    stockQuantity: 9,  categoryId: { name: "Household" } },
];

export default function StockManagerDashboard() {
  const [, navigate] = useLocation();

  // Try tRPC; fall back to mock on error
  const summaryQuery = trpc.stockManager?.summary?.useQuery(undefined, { retry: false });
  const alertsQuery  = trpc.stockManager?.lowStockAlerts?.useQuery({ threshold: 10 }, { retry: false });

  const summary   = summaryQuery?.data   ?? MOCK_SUMMARY;
  const lowStock  = alertsQuery?.data    ?? MOCK_LOW_STOCK;
  const isLoading = summaryQuery?.isLoading ?? false;

  const statCards = [
    {
      title: "Total Products",
      value: summary.totalProducts,
      icon: Package,
      color: "#1A1A2E",
      bg: "#E8DCC8",
      action: () => navigate("/stock-manager/adjust"),
    },
    {
      title: "Low Stock",
      value: summary.lowStockProducts,
      icon: AlertTriangle,
      color: "#E65100",
      bg: "#FFF3E0",
      action: () => navigate("/stock-manager/low-stock"),
    },
    {
      title: "Out of Stock",
      value: summary.outOfStockProducts,
      icon: XCircle,
      color: "#B71C1C",
      bg: "#FFEBEE",
      action: () => navigate("/stock-manager/low-stock"),
    },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", background: "#f8f6f0", minHeight: "100vh" }}>
      <DashboardHeader
        title="Stock Manager"
        subtitle="Gimbiya Mall — Inventory Control"
        role="stock_manager"
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
          {statCards.map((card) => (
            <button
              key={card.title}
              onClick={card.action}
              style={{
                background: "white", borderRadius: 12, padding: "20px 22px",
                border: `1px solid ${card.color}22`, textAlign: "left", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: ".15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <card.icon size={20} color={card.color} />
                </div>
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{card.title}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>
                {isLoading ? "—" : card.value}
              </div>
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Adjust Stock",      icon: RefreshCw,    path: "/stock-manager/adjust",    color: "#1A1A2E" },
            { label: "Low Stock Alerts",  icon: AlertTriangle, path: "/stock-manager/low-stock", color: "#E65100" },
            { label: "Inventory History", icon: TrendingDown,  path: "/stock-manager/history",   color: "#0D47A1" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "white", border: `1.5px solid ${action.color}33`,
                borderRadius: 10, padding: "14px 18px", cursor: "pointer",
                transition: ".15s", fontFamily: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <action.icon size={18} color={action.color} />
                <span style={{ fontSize: 13, fontWeight: 700, color: action.color }}>{action.label}</span>
              </div>
              <ArrowRight size={16} color={action.color} />
            </button>
          ))}
        </div>

        {/* Low stock preview */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2ddd4", overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid #e2ddd4",
            background: "#1A1A2E",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={18} color="#C8A84B" />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#C8A84B" }}>
                Low Stock Alerts ({lowStock.length})
              </span>
            </div>
            <button
              onClick={() => navigate("/stock-manager/low-stock")}
              style={{ fontSize: 12, color: "#C8A84B", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              View All →
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f6f0" }}>
                {["Product", "Category", "Stock", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStock.slice(0, 6).map((p: any, i: number) => {
                const isOut = p.stockQuantity === 0;
                return (
                  <tr key={p._id} style={{ borderTop: "1px solid #f1ede6", background: i % 2 === 0 ? "white" : "#fdfaf6" }}>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>{p.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{(p.categoryId as any)?.name ?? "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-block", padding: "2px 10px", borderRadius: 20,
                        fontSize: 12, fontWeight: 700,
                        background: isOut ? "#FFEBEE" : "#FFF3E0",
                        color: isOut ? "#B71C1C" : "#E65100",
                      }}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={isOut ? "destructive" : "secondary"} style={{ fontSize: 11 }}>
                        {isOut ? "Out of Stock" : "Low"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
