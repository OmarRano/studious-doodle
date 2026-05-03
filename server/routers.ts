/**
 * Main tRPC application router — MongoDB / Mongoose only
 */

import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./auth";
import { z } from "zod";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import {
  adminProcedure, managerProcedure, deliveryProcedure,
  readerProcedure, buyerProcedure, adminOrManagerProcedure,
  adminOrDeveloperProcedure, staffProcedure, developerProcedure,
  stockManagerProcedure, inventoryProcedure,
} from "./rbac";
import {
  getProductById, getProductsByCategory, searchProducts,
  getCartItems, addToCart, removeFromCart, clearCart,
  getUserOrders, getOrderByOrderId, getDeliveryOrders,
  getAllCategories, getFeaturedProducts, getAllUsers,
  getTotalSalesStats, getPlatformStats, updateUserRole, setUserAffiliate,
} from "./db";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Order } from "./models/Order";
import { CartItem } from "./models/CartItem";
import { User } from "./models/User";
import { Store } from "./models/Store";
import { calcFinalPrice, calcOrderTotals } from "./pricing";

const paginationInput = z.object({
  limit:  z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const appRouter = router({
  auth: authRouter,

  // ── PRODUCTS ─────────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(paginationInput)
      .query(async ({ input }) =>
        Product.find({ isActive: true }).populate("categoryId").skip(input.offset).limit(input.limit).lean()
      ),
    featured: publicProcedure.query(() => getFeaturedProducts(10)),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => getProductsByCategory(input.categoryId, input.limit, input.offset)),
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => searchProducts(input.query, input.limit, input.offset)),
    detail: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getProductById(input.id)),
    create: managerProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        categoryId: z.string(),
        storeId: z.string().optional(), // For virtual mall
        costPrice: z.number().min(0),
        baseSalePrice: z.number().min(0),
        commissionPercent: z.number().min(0).max(100).default(10),
        stockQuantity: z.number().min(0).default(0),
        images: z.array(z.string()).default([]),
        arEnabled: z.boolean().default(false), // Virtual mall
        limitedOffer: z.string().optional(), // Virtual mall
      }))
      .mutation(async ({ input, ctx }) => {
        const finalPrice = calcFinalPrice(input.baseSalePrice, input.commissionPercent);
        const p = await Product.create({
          ...input,
          categoryId: new mongoose.Types.ObjectId(input.categoryId),
          storeId: input.storeId ? new mongoose.Types.ObjectId(input.storeId) : undefined,
          finalPrice,
          createdBy: (ctx.user as any)._id,
        });
        // If storeId provided, add product to store's products array
        if (input.storeId) {
          await Store.findByIdAndUpdate(input.storeId, { $push: { products: p._id } });
        }
        return { success: true, id: p._id.toString() };
      }),
    update: managerProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        baseSalePrice: z.number().optional(),
        commissionPercent: z.number().optional(),
        stockQuantity: z.number().optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const product = await Product.findById(id);
        if (!product) throw new Error("Product not found");
        if (updates.baseSalePrice !== undefined || updates.commissionPercent !== undefined) {
          const price = updates.baseSalePrice ?? product.baseSalePrice;
          const pct   = updates.commissionPercent ?? product.commissionPercent;
          (updates as any).finalPrice = calcFinalPrice(price, pct);
        }
        await Product.findByIdAndUpdate(id, updates);
        return { success: true };
      }),
    delete: managerProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await Product.findByIdAndUpdate(input.id, { isActive: false });
        return { success: true };
      }),
  }),

  // ── STORES ──────────────────────────────────────────────────────────────────
  stores: router({
    list: publicProcedure
      .input(paginationInput)
      .query(async ({ input }) =>
        Store.find({ isActive: true }).populate('products').skip(input.offset).limit(input.limit).lean()
      ),
    detail: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const store = await Store.findById(input.id).populate('products').lean();
        if (!store) throw new Error("Store not found");
        return store;
      }),
    create: adminOrManagerProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.enum(['store', 'office']).default('store'),
        description: z.string().optional(),
        bannerImageUrl: z.string().optional(),
        buildingLevel: z.number().default(1),
        location: z.object({ x: z.number(), y: z.number() }).optional(),
        marketingPitch: z.object({
          headline: z.string().optional(),
          promoText: z.string().optional(),
          ctaLink: z.string().optional(),
          videoUrl: z.string().optional(),
        }).optional(),
        flyers: z.array(z.object({
          title: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          validUntil: z.date().optional(),
        })).default([]),
      }))
      .mutation(async ({ input }) => {
        const store = await Store.create(input);
        return { success: true, id: store._id.toString() };
      }),
    update: adminOrManagerProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        bannerImageUrl: z.string().optional(),
        buildingLevel: z.number().optional(),
        location: z.object({ x: z.number(), y: z.number() }).optional(),
        marketingPitch: z.object({
          headline: z.string().optional(),
          promoText: z.string().optional(),
          ctaLink: z.string().optional(),
          videoUrl: z.string().optional(),
        }).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await Store.findByIdAndUpdate(id, updates);
        return { success: true };
      }),
    addFlyer: adminOrManagerProcedure
      .input(z.object({
        storeId: z.string(),
        flyer: z.object({
          title: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          validUntil: z.date().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await Store.findByIdAndUpdate(input.storeId, { $push: { flyers: input.flyer } });
        return { success: true };
      }),
  }),

  // ── CATEGORIES ───────────────────────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => getAllCategories()),
    create: adminOrManagerProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ input }) => {
        const cat = await Category.create(input);
        return { success: true, id: cat._id.toString() };
      }),
    update: adminOrManagerProcedure
      .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await Category.findByIdAndUpdate(id, updates);
        return { success: true };
      }),
  }),

  // ── CART ─────────────────────────────────────────────────────────────────────
  cart: router({
    list: buyerProcedure.query(async ({ ctx }) => getCartItems((ctx.user as any)._id.toString())),
    add: buyerProcedure
      .input(z.object({ productId: z.string(), quantity: z.number().min(1) }))
      .mutation(async ({ input, ctx }) => {
        await addToCart((ctx.user as any)._id.toString(), input.productId, input.quantity);
        return { success: true };
      }),
    remove: buyerProcedure
      .input(z.object({ cartItemId: z.string() }))
      .mutation(async ({ input }) => { await removeFromCart(input.cartItemId); return { success: true }; }),
    updateQuantity: buyerProcedure
      .input(z.object({ cartItemId: z.string(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        await CartItem.findByIdAndUpdate(input.cartItemId, { quantity: input.quantity });
        return { success: true };
      }),
    clear: buyerProcedure.mutation(async ({ ctx }) => {
      await clearCart((ctx.user as any)._id.toString());
      return { success: true };
    }),
  }),

  // ── ORDERS ───────────────────────────────────────────────────────────────────
  orders: router({
    list: buyerProcedure
      .input(paginationInput)
      .query(async ({ input, ctx }) => getUserOrders((ctx.user as any)._id.toString(), input.limit, input.offset)),
    detail: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByOrderId(input.orderId);
        if (!order) throw new Error("Order not found");
        return order;
      }),
    create: buyerProcedure
      .input(z.object({
        shippingAddress:  z.string(),
        shippingCity:     z.string(),
        shippingState:    z.string().optional(),
        shippingZipCode:  z.string().optional(),
        shippingCountry:  z.string().default("Nigeria"),
        buyerPhone:       z.string(),
        referralCode:     z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId    = (ctx.user as any)._id.toString();
        const items_raw = await getCartItems(userId);
        if (items_raw.length === 0) throw new Error("Your cart is empty.");

        const lineItems = items_raw.map((item: any) => {
          const p = item.productId as any;
          return { finalPrice: p.finalPrice as number, baseSalePrice: p.baseSalePrice as number, quantity: item.quantity as number };
        });
        const totals = calcOrderTotals(lineItems);

        const items: any[] = items_raw.map((item: any) => {
          const p = item.productId as any;
          return {
            productId: p._id, name: p.name, quantity: item.quantity,
            costPrice: p.costPrice, baseSalePrice: p.baseSalePrice,
            commissionPercent: p.commissionPercent,
            commissionAmount: parseFloat(((p.finalPrice - p.baseSalePrice) * item.quantity).toFixed(2)),
            finalPrice: p.finalPrice, subtotal: parseFloat((p.finalPrice * item.quantity).toFixed(2)),
          };
        });

        const orderId = `ORD-${nanoid(10).toUpperCase()}`;
        await Order.create({
          orderId, buyerId: userId, items,
          totalAmount: totals.subtotal,
          commissionAmount: totals.commissionTotal,
          finalAmount: totals.totalAmount,
          ...input,
        });
        await clearCart(userId);
        return { success: true, orderId, totalAmount: totals.totalAmount };
      }),

    // Order cancellation: buyer only, pending/paid only, restores stock
    cancel: buyerProcedure
      .input(z.object({ orderId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const order = await getOrderByOrderId(input.orderId);
        if (!order) throw new Error("Order not found");
        if ((order as any).buyerId.toString() !== (ctx.user as any)._id.toString())
          throw new Error("Not authorised to cancel this order");
        if (!["pending", "paid"].includes(order.status))
          throw new Error("Order cannot be cancelled at this stage");
        for (const item of (order as any).items ?? []) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
        }
        await Order.findOneAndUpdate({ orderId: input.orderId }, { status: "cancelled" });
        return { success: true };
      }),

    updateStatus: staffProcedure
      .input(z.object({ orderId: z.string(), status: z.enum(["pending","paid","processing","assigned","in_transit","delivered","cancelled"]) }))
      .mutation(async ({ input }) => {
        await Order.findOneAndUpdate({ orderId: input.orderId }, { status: input.status });
        return { success: true };
      }),
  }),

  // ── DELIVERY ─────────────────────────────────────────────────────────────────
  delivery: router({
    myOrders: deliveryProcedure
      .input(paginationInput)
      .query(async ({ input, ctx }) => getDeliveryOrders((ctx.user as any)._id.toString(), input.limit, input.offset)),
    updateStatus: deliveryProcedure
      .input(z.object({ orderId: z.string(), status: z.enum(["assigned","in_transit","delivered"]) }))
      .mutation(async ({ input }) => {
        const update: any = { status: input.status };
        if (input.status === "delivered") update.paymentStatus = "paid";
        await Order.findOneAndUpdate({ orderId: input.orderId }, update);
        return { success: true };
      }),
    assignOrder: adminOrManagerProcedure
      .input(z.object({ orderId: z.string(), riderId: z.string() }))
      .mutation(async ({ input }) => {
        await Order.findOneAndUpdate({ orderId: input.orderId }, { deliveryRiderId: input.riderId, status: "assigned" });
        return { success: true };
      }),
  }),

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  admin: router({
    stats:      adminProcedure.query(() => getPlatformStats()),
    salesStats: adminProcedure.query(() => getTotalSalesStats()),
    users: adminOrDeveloperProcedure
      .input(z.object({ role: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => getAllUsers(input.role, input.limit, input.offset)),
    updateUserRole: adminOrDeveloperProcedure
      .input(z.object({ userId: z.string(), role: z.string() }))
      .mutation(async ({ input }) => { await updateUserRole(input.userId, input.role); return { success: true }; }),
    enableAffiliate: adminOrDeveloperProcedure
      .input(z.object({ userId: z.string(), enable: z.boolean() }))
      .mutation(async ({ input }) => { await setUserAffiliate(input.userId, input.enable); return { success: true }; }),
    allOrders: adminProcedure
      .input(z.object({ status: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const filter: any = {};
        if (input.status) filter.status = input.status;
        return Order.find(filter).sort({ createdAt: -1 }).skip(input.offset).limit(input.limit).populate("buyerId", "name email phone").lean();
      }),
    onboardStockManager: adminProcedure
      .input(z.object({
        name:     z.string().min(2),
        email:    z.string().email(),
        password: z.string().min(8),
        phone:    z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await User.findOne({ email: input.email.toLowerCase() });
        if (existing) throw new Error("A user with this email already exists");
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(input.password, salt);
        const user = await User.create({ name: input.name, email: input.email.toLowerCase(), passwordHash, phone: input.phone, role: "stock_manager", isActive: true });
        return { success: true, userId: user._id.toString() };
      }),
    listStaff: adminProcedure
      .input(z.object({ role: z.string().optional() }))
      .query(async ({ input }) => {
        const filter: any = { role: { $in: ["manager","stock_manager","delivery"] } };
        if (input.role) filter.role = input.role;
        return User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).lean();
      }),
    toggleUserActive: adminProcedure
      .input(z.object({ userId: z.string(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await User.findByIdAndUpdate(input.userId, { isActive: input.isActive });
        return { success: true };
      }),
  }),

  // ── AFFILIATE ────────────────────────────────────────────────────────────────
  affiliate: router({
    getReferralLink: readerProcedure.query(async ({ ctx }) => {
      const userId  = (ctx.user as any)._id.toString();
      const code    = `REF-${userId.slice(-8).toUpperCase()}`;
      const baseUrl = process.env.VITE_APP_URL ?? "http://localhost:3000";
      return { code, url: `${baseUrl}/products?ref=${code}` };
    }),
    myStats: readerProcedure.query(async ({ ctx }) => {
      const userId = (ctx.user as any)._id.toString();
      const code   = `REF-${userId.slice(-8).toUpperCase()}`;
      const totalReferrals = await Order.countDocuments({ referralCode: code });
      return { totalReferrals, totalEarnings: 0 };
    }),
  }),

  // ── INVENTORY (shared: manager + stock_manager + admin + developer) ───────────
  inventory: router({
    list: inventoryProcedure
      .input(paginationInput)
      .query(async ({ input }) =>
        Product.find({ isActive: true })
          .select("name stockQuantity soldQuantity isFeatured categoryId images")
          .populate("categoryId", "name")
          .skip(input.offset).limit(input.limit).lean()
      ),
    adjustStock: inventoryProcedure
      .input(z.object({
        productId:      z.string(),
        quantityChange: z.number(),
        reason:         z.enum(["restock","sale_adjustment","damage","return","correction","other"]),
        notes:          z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await Product.findById(input.productId);
        if (!product) throw new Error("Product not found");
        const newStock = product.stockQuantity + input.quantityChange;
        if (newStock < 0) throw new Error("Stock cannot go below zero");
        await Product.findByIdAndUpdate(input.productId, { stockQuantity: newStock });
        console.log(`[Inventory] ${(ctx.user as any).name} adjusted ${product.name} by ${input.quantityChange} (${input.reason}). New: ${newStock}`);
        return { success: true, newStock };
      }),
    lowStock: inventoryProcedure
      .input(z.object({ threshold: z.number().min(0).default(10) }))
      .query(async ({ input }) =>
        Product.find({ stockQuantity: { $lte: input.threshold }, isActive: true })
          .populate("categoryId", "name").lean()
      ),
    recentActivity: inventoryProcedure
      .input(paginationInput)
      .query(async ({ input }) =>
        Product.find({ isActive: true }).sort({ updatedAt: -1 })
          .skip(input.offset).limit(input.limit)
          .select("name stockQuantity soldQuantity updatedAt").lean()
      ),
  }),

  // ── STOCK MANAGER ─────────────────────────────────────────────────────────────
  stockManager: router({
    summary: stockManagerProcedure.query(async () => {
      const [totalProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Product.countDocuments({ isActive: true, stockQuantity: { $gt: 0, $lte: 10 } }),
        Product.countDocuments({ isActive: true, stockQuantity: 0 }),
      ]);
      return { totalProducts, lowStockProducts, outOfStockProducts };
    }),
    products: stockManagerProcedure
      .input(paginationInput)
      .query(async ({ input }) =>
        Product.find({ isActive: true })
          .select("name stockQuantity soldQuantity categoryId images isFeatured")
          .populate("categoryId", "name")
          .skip(input.offset).limit(input.limit).lean()
      ),
    lowStockAlerts: stockManagerProcedure
      .input(z.object({ threshold: z.number().default(10) }))
      .query(async ({ input }) =>
        Product.find({ stockQuantity: { $lte: input.threshold }, isActive: true })
          .populate("categoryId", "name").sort({ stockQuantity: 1 }).lean()
      ),
    adjustStock: stockManagerProcedure
      .input(z.object({
        productId:      z.string(),
        quantityChange: z.number(),
        reason:         z.enum(["restock","sale_adjustment","damage","return","correction","other"]),
        notes:          z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await Product.findById(input.productId);
        if (!product) throw new Error("Product not found");
        const newStock = product.stockQuantity + input.quantityChange;
        if (newStock < 0) throw new Error("Stock cannot go below zero");
        await Product.findByIdAndUpdate(input.productId, { stockQuantity: newStock });
        console.log(`[StockMgr] ${(ctx.user as any).name} -> ${product.name}: ${input.quantityChange > 0 ? "+" : ""}${input.quantityChange} (${input.reason}). New: ${newStock}`);
        return { success: true, newStock };
      }),
    requestRestock: stockManagerProcedure
      .input(z.object({
        productId:    z.string(),
        requestedQty: z.number().min(1),
        urgency:      z.enum(["low","medium","high"]).default("medium"),
        notes:        z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await Product.findById(input.productId);
        if (!product) throw new Error("Product not found");
        console.log(`[RestockRequest] ${(ctx.user as any).name} requested ${input.requestedQty}x "${product.name}" (${input.urgency})`);
        return { success: true, message: `Restock request submitted for ${product.name}` };
      }),
  }),

  // ── DEVELOPER ────────────────────────────────────────────────────────────────
  developer: router({
    platformStats: developerProcedure.query(() => getPlatformStats()),
    salesStats:    developerProcedure.query(() => getTotalSalesStats()),

    stores: router({
      list: developerProcedure.query(async () => {
        const admins = await User.find({ role: "admin" }).select("name email isActive createdAt").lean();
        return admins.map((a: any) => ({
          id: a._id.toString(),
          adminName: a.name, adminEmail: a.email,
          isActive: a.isActive, createdDate: a.createdAt,
          storeCode: `STORE-${a._id.toString().slice(-6).toUpperCase()}`,
          storeName: `${a.name}'s Store`,
        }));
      }),
      create: developerProcedure
        .input(z.object({
          adminName:     z.string().min(2),
          adminEmail:    z.string().email(),
          adminPassword: z.string().min(8),
          phone:         z.string().optional(),
          storeName:     z.string().min(2),
        }))
        .mutation(async ({ input }) => {
          const existing = await User.findOne({ email: input.adminEmail.toLowerCase() });
          if (existing) throw new Error("A user with this email already exists");
          const salt = await bcrypt.genSalt(12);
          const passwordHash = await bcrypt.hash(input.adminPassword, salt);
          const admin = await User.create({ name: input.adminName, email: input.adminEmail.toLowerCase(), passwordHash, phone: input.phone, role: "admin", isActive: true });
          return { success: true, adminId: admin._id.toString(), storeCode: `STORE-${admin._id.toString().slice(-6).toUpperCase()}` };
        }),
      toggle: developerProcedure
        .input(z.object({ adminId: z.string(), isActive: z.boolean() }))
        .mutation(async ({ input }) => {
          await User.findByIdAndUpdate(input.adminId, { isActive: input.isActive });
          return { success: true };
        }),
    }),

    branches: router({
      list: developerProcedure.query(async () => {
        const managers = await User.find({ role: "manager" }).select("name email isActive createdAt city state").lean();
        return managers.map((m: any) => ({
          id: m._id.toString(), managerName: m.name, email: m.email,
          city: m.city ?? "—", state: m.state ?? "—",
          isActive: m.isActive, createdDate: m.createdAt,
          branchCode: `BR-${m._id.toString().slice(-6).toUpperCase()}`,
        }));
      }),
      create: developerProcedure
        .input(z.object({
          managerName:     z.string().min(2),
          managerEmail:    z.string().email(),
          managerPassword: z.string().min(8),
          phone:           z.string().optional(),
          city:            z.string().optional(),
          state:           z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const existing = await User.findOne({ email: input.managerEmail.toLowerCase() });
          if (existing) throw new Error("A user with this email already exists");
          const salt = await bcrypt.genSalt(12);
          const passwordHash = await bcrypt.hash(input.managerPassword, salt);
          const manager = await User.create({ name: input.managerName, email: input.managerEmail.toLowerCase(), passwordHash, phone: input.phone, city: input.city, state: input.state, role: "manager", isActive: true });
          return { success: true, managerId: manager._id.toString(), branchCode: `BR-${manager._id.toString().slice(-6).toUpperCase()}` };
        }),
      toggle: developerProcedure
        .input(z.object({ managerId: z.string(), isActive: z.boolean() }))
        .mutation(async ({ input }) => {
          await User.findByIdAndUpdate(input.managerId, { isActive: input.isActive });
          return { success: true };
        }),
    }),

    users: router({
      list: developerProcedure
        .input(z.object({ role: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
        .query(async ({ input }) => {
          const filter: any = input.role
            ? { role: input.role }
            : { role: { $in: ["admin","manager","stock_manager","delivery","developer"] } };
          return User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).skip(input.offset).limit(input.limit).lean();
        }),
      create: developerProcedure
        .input(z.object({
          name:     z.string().min(2),
          email:    z.string().email(),
          password: z.string().min(8),
          role:     z.enum(["admin","manager","stock_manager","delivery"]),
          phone:    z.string().optional(),
          city:     z.string().optional(),
          state:    z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const existing = await User.findOne({ email: input.email.toLowerCase() });
          if (existing) throw new Error("A user with this email already exists");
          const salt = await bcrypt.genSalt(12);
          const passwordHash = await bcrypt.hash(input.password, salt);
          const user = await User.create({ name: input.name, email: input.email.toLowerCase(), passwordHash, phone: input.phone, city: input.city, state: input.state, role: input.role, isActive: true });
          return { success: true, userId: user._id.toString() };
        }),
      toggle: developerProcedure
        .input(z.object({ userId: z.string(), isActive: z.boolean() }))
        .mutation(async ({ input }) => {
          await User.findByIdAndUpdate(input.userId, { isActive: input.isActive });
          return { success: true };
        }),
      updateRole: developerProcedure
        .input(z.object({ userId: z.string(), role: z.enum(["admin","manager","stock_manager","delivery","developer"]) }))
        .mutation(async ({ input }) => {
          await User.findByIdAndUpdate(input.userId, { role: input.role });
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
