import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, AlertTriangle, TrendingUp, Plus } from "lucide-react";

export default function ManagerDashboard() {
  const [, navigate] = useLocation();

  const inventoryData = [
    { product: "Product A", stock: 120, sold: 45 },
    { product: "Product B", stock: 89, sold: 67 },
    { product: "Product C", stock: 34, sold: 89 },
    { product: "Product D", stock: 156, sold: 23 },
    { product: "Product E", stock: 12, sold: 156 },
  ];

  const salesData = [
    { day: "Mon", sales: 400 },
    { day: "Tue", sales: 300 },
    { day: "Wed", sales: 200 },
    { day: "Thu", sales: 278 },
    { day: "Fri", sales: 190 },
    { day: "Sat", sales: 229 },
    { day: "Sun", sales: 200 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="Store Manager Dashboard"
        subtitle="Manage products and inventory"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">156</p>
                  <p className="text-xs text-green-600 mt-1">+5 this week</p>
                </div>
                <Package className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">8</p>
                  <p className="text-xs text-red-600 mt-1">Require attention</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Weekly Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">₦89K</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last week</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Stock levels by product</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#3b82f6" />
                  <Bar dataKey="sold" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Weekly Sales Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Add, edit, or remove products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Active Products: <span className="font-bold">156</span></p>
                <p className="text-sm text-slate-600">Inactive Products: <span className="font-bold">12</span></p>
              </div>
              <Button onClick={() => navigate("/manager/products")} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Monitor and adjust stock levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Total Stock Value: <span className="font-bold">₦2.3M</span></p>
                <p className="text-sm text-slate-600">Items Below Threshold: <span className="font-bold text-red-600">8</span></p>
              </div>
              <Button onClick={() => navigate("/manager/inventory")} variant="outline" className="w-full">
                View Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
