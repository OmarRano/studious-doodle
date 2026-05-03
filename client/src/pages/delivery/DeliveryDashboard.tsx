import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Truck, MapPin, CheckCircle, Clock } from "lucide-react";

export default function DeliveryDashboard() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="Delivery Dashboard"
        subtitle="Manage your deliveries and track orders"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Assigned Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">12</p>
                  <p className="text-xs text-blue-600 mt-1">Today</p>
                </div>
                <Truck className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">5</p>
                  <p className="text-xs text-amber-600 mt-1">Active</p>
                </div>
                <MapPin className="w-12 h-12 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">7</p>
                  <p className="text-xs text-green-600 mt-1">This week</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">3</p>
                  <p className="text-xs text-slate-600 mt-1">Awaiting pickup</p>
                </div>
                <Clock className="w-12 h-12 text-slate-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Active Deliveries</CardTitle>
              <CardDescription>Orders currently in transit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium">Order #001</p>
                  <p className="text-sm text-slate-600">Destination: Lekki, Lagos</p>
                  <p className="text-sm text-amber-600">In Transit</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium">Order #002</p>
                  <p className="text-sm text-slate-600">Destination: Ikoyi, Lagos</p>
                  <p className="text-sm text-amber-600">In Transit</p>
                </div>
              </div>
              <Button onClick={() => navigate("/delivery/orders")} className="w-full mt-4">
                View All Orders
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Earnings</CardTitle>
              <CardDescription>Delivery commissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">₦5,200</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">This Week</p>
                  <p className="text-2xl font-bold text-slate-900">₦28,500</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
