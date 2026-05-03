import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ShoppingBag, Heart, MapPin, Clock, CheckCircle, AlertCircle, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BuyerDashboard() {
  const [, navigate] = useLocation();
  const [isAffiliateEnabled] = useState(false); // This would come from user data

  // Mock order data
  const orders = [
    {
      id: "ORD-001",
      date: "2026-03-01",
      total: "₦15,500",
      status: "delivered",
      items: 3,
      image: "📦",
    },
    {
      id: "ORD-002",
      date: "2026-02-28",
      total: "₦8,200",
      status: "in-transit",
      items: 1,
      image: "🚚",
    },
    {
      id: "ORD-003",
      date: "2026-02-25",
      total: "₦22,900",
      status: "processing",
      items: 5,
      image: "⏳",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      delivered: "bg-green-100 text-green-800",
      "in-transit": "bg-blue-100 text-blue-800",
      processing: "bg-amber-100 text-amber-800",
      pending: "bg-slate-100 text-slate-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-slate-100 text-slate-800";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      delivered: <CheckCircle className="w-4 h-4" />,
      "in-transit": <MapPin className="w-4 h-4" />,
      processing: <Clock className="w-4 h-4" />,
      pending: <AlertCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        title="My Shopping Dashboard"
        subtitle="Manage your orders and account"
      />

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">12</p>
                  <p className="text-xs text-slate-600 mt-1">All time</p>
                </div>
                <ShoppingBag className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">₦156K</p>
                  <p className="text-xs text-slate-600 mt-1">Lifetime</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Saved Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">8</p>
                  <p className="text-xs text-slate-600 mt-1">In wishlist</p>
                </div>
                <Heart className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Loyalty Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">2,450</p>
                  <p className="text-xs text-slate-600 mt-1">Points earned</p>
                </div>
                <Star className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track and manage your purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-3xl">{order.image}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{order.id}</p>
                              <Badge variant="outline" className={getStatusColor(order.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status.replace("-", " ").toUpperCase()}
                                </span>
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {order.items} item{order.items > 1 ? "s" : ""} • Ordered on {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{order.total}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="mt-2"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => navigate("/mall")} className="w-full">
              Continue Shopping
            </Button>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">You have 8 items saved in your wishlist</p>
                  <Button onClick={() => navigate("/mall")} className="mt-4">
                    Browse Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Full Name</p>
                    <p className="font-medium text-slate-900">Engr Umar Ayuba Rano</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email Address</p>
                    <p className="font-medium text-slate-900">umar@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone Number</p>
                    <p className="font-medium text-slate-900">+234 (0) 123 456 7890</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Addresses</CardTitle>
                  <CardDescription>Manage delivery addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-900">Home</p>
                    <p className="text-xs text-slate-600 mt-1">
                      123 Main Street, Lagos, Nigeria
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Addresses
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Affiliate Section */}
            {!isAffiliateEnabled && (
              <Card className="border-0 shadow-md border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Become an Affiliate
                  </CardTitle>
                  <CardDescription>
                    Earn commissions by referring customers to Gimbiya Mall
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    As an affiliate, you can earn commissions on every sale made through your referral link. 
                    Contact our admin team to enable affiliate features on your account.
                  </p>
                  <Button className="w-full">
                    Request Affiliate Access
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAffiliateEnabled && (
              <Card className="border-0 shadow-md border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Affiliate Dashboard
                  </CardTitle>
                  <CardDescription>
                    You're an active affiliate! Access your earnings and referral tools.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/affiliate")} className="w-full">
                    Go to Affiliate Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
