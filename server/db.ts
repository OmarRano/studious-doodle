/**
 * MongoDB database helpers
 * Replaces the old Drizzle / MySQL db.ts entirely.
 */

import mongoose from "mongoose";
import { User, type IUser } from "./models/User";
import { Product, type IProduct } from "./models/Product";
import { Category, type ICategory } from "./models/Category";
import { Order, type IOrder } from "./models/Order";
import { CartItem } from "./models/CartItem";

// ─── Connection ──────────────────────────────────────────────────────────────

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<IUser | null> {
  return User.findById(id).lean<IUser>();
}

export async function getAllUsers(
  role?: string,
  limit = 50,
  offset = 0
): Promise<IUser[]> {
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  return User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean<IUser[]>();
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { role });
}

export async function setUserAffiliate(userId: string, isAffiliate: boolean): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    isAffiliate,
    role: isAffiliate ? "reader" : "buyer",
  });
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProductById(id: string): Promise<IProduct | null> {
  return Product.findById(id).populate("categoryId").lean<IProduct>();
}

export async function getFeaturedProducts(limit = 10): Promise<IProduct[]> {
  return Product.find({ isFeatured: true, isActive: true })
    .populate("categoryId")
    .limit(limit)
    .lean<IProduct[]>();
}

export async function getProductsByCategory(
  categoryId: string,
  limit = 20,
  offset = 0
): Promise<IProduct[]> {
  return Product.find({ categoryId, isActive: true })
    .skip(offset)
    .limit(limit)
    .lean<IProduct[]>();
}

export async function searchProducts(
  query: string,
  limit = 20,
  offset = 0
): Promise<IProduct[]> {
  return Product.find({ $text: { $search: query }, isActive: true })
    .skip(offset)
    .limit(limit)
    .lean<IProduct[]>();
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<ICategory[]> {
  return Category.find({ isActive: true }).lean<ICategory[]>();
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export async function getCartItems(userId: string) {
  return CartItem.find({ userId }).populate("productId").lean();
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<void> {
  await CartItem.findOneAndUpdate(
    { userId, productId },
    { $inc: { quantity } },
    { upsert: true, new: true }
  );
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  await CartItem.findByIdAndDelete(cartItemId);
}

export async function clearCart(userId: string): Promise<void> {
  await CartItem.deleteMany({ userId });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getUserOrders(
  userId: string,
  limit = 20,
  offset = 0
): Promise<IOrder[]> {
  return Order.find({ buyerId: userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean<IOrder[]>();
}

export async function getOrderByOrderId(orderId: string): Promise<IOrder | null> {
  return Order.findOne({ orderId }).lean<IOrder>();
}

export async function getDeliveryOrders(
  riderId: string,
  limit = 20,
  offset = 0
): Promise<IOrder[]> {
  return Order.find({ deliveryRiderId: riderId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("buyerId", "name phone")
    .lean<IOrder[]>();
}

// ─── Platform stats ──────────────────────────────────────────────────────────

export async function getPlatformStats() {
  const [totalUsers, totalBuyers, totalProducts, totalOrders, deliveredOrders] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: "delivered" }),
    ]);

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$finalAmount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total ?? 0;

  return { totalUsers, totalBuyers, totalProducts, totalOrders, deliveredOrders, totalRevenue };
}

export async function getTotalSalesStats() {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$finalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
}
