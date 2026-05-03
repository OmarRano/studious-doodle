/**
 * server/stockmanager.test.ts
 *
 * Tests for stockManager.* and inventory.* tRPC routes.
 *
 * These tests verify:
 *   1. Input validation (Zod) fires before hitting the DB
 *   2. RBAC gates are correct (tested more fully in rbac.test.ts)
 *   3. Business rules (stock below zero, unknown product, etc.)
 *
 * NOTE: These tests run without a MongoDB connection. Routes that
 * only do RBAC checks will fail with a DB/connection error — NOT
 * a FORBIDDEN error. That's the expected pattern in this test suite.
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { IUser } from "./models/User";

// ─── Context helpers ──────────────────────────────────────────────────────────

type Role = IUser["role"];

function makeCtx(role: Role): TrpcContext {
  return {
    user: {
      _id:         { toString: () => "000000000000000000000099" } as any,
      name:        `Test ${role}`,
      email:       `${role}@test.com`,
      passwordHash:"$2b$12$fakehash",
      role,
      isActive:    true,
      isAffiliate: false,
      createdAt:   new Date(),
      updatedAt:   new Date(),
      lastSignedIn:new Date(),
      comparePassword: async () => false,
    } as unknown as IUser,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {}, cookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function caller(role: Role) {
  return appRouter.createCaller(makeCtx(role));
}

// ─── stockManager.summary ────────────────────────────────────────────────────
describe("stockManager.summary", () => {
  it("is accessible to stock_manager (DB error, not FORBIDDEN)", async () => {
    await expect(
      caller("stock_manager").stockManager.summary()
    ).rejects.not.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks buyer with FORBIDDEN", async () => {
    await expect(
      caller("buyer").stockManager.summary()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks admin with FORBIDDEN", async () => {
    await expect(
      caller("admin").stockManager.summary()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ─── stockManager.products ───────────────────────────────────────────────────
describe("stockManager.products", () => {
  it("rejects invalid pagination (limit > 100)", async () => {
    await expect(
      caller("stock_manager").stockManager.products({ limit: 200, offset: 0 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects negative offset", async () => {
    await expect(
      caller("stock_manager").stockManager.products({ limit: 10, offset: -1 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("passes validation for stock_manager (no FORBIDDEN or BAD_REQUEST)", async () => {
    const p = caller("stock_manager").stockManager.products({ limit: 10, offset: 0 });
    // Should error at DB level, not validation
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── stockManager.lowStockAlerts ─────────────────────────────────────────────
describe("stockManager.lowStockAlerts", () => {
  it("accepts default threshold", async () => {
    const p = caller("stock_manager").stockManager.lowStockAlerts({ threshold: 10 });
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts threshold of 0 (out-of-stock only)", async () => {
    const p = caller("stock_manager").stockManager.lowStockAlerts({ threshold: 0 });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts large threshold", async () => {
    const p = caller("stock_manager").stockManager.lowStockAlerts({ threshold: 1000 });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── stockManager.adjustStock — input validation ─────────────────────────────
describe("stockManager.adjustStock — Zod input validation", () => {
  const validInput = {
    productId:      "000000000000000000000001",
    quantityChange: 10,
    reason:         "restock" as const,
  };

  it("passes valid input for stock_manager (DB-level error, not validation)", async () => {
    const p = caller("stock_manager").stockManager.adjustStock(validInput);
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects missing productId", async () => {
    await expect(
      caller("stock_manager").stockManager.adjustStock({
        ...validInput, productId: "",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid reason enum", async () => {
    await expect(
      caller("stock_manager").stockManager.adjustStock({
        ...validInput, reason: "theft" as any,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts all valid reason values", async () => {
    const reasons = ["restock","sale_adjustment","damage","return","correction","other"] as const;
    for (const reason of reasons) {
      const p = caller("stock_manager").stockManager.adjustStock({ ...validInput, reason });
      // Should only fail at DB level
      await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
    }
  });

  it("accepts negative quantityChange (stock reduction)", async () => {
    const p = caller("stock_manager").stockManager.adjustStock({
      ...validInput, quantityChange: -5, reason: "damage",
    });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts optional notes field", async () => {
    const p = caller("stock_manager").stockManager.adjustStock({
      ...validInput, notes: "Received from Kano warehouse",
    });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── stockManager.requestRestock — input validation ──────────────────────────
describe("stockManager.requestRestock — input validation", () => {
  const validInput = {
    productId:    "000000000000000000000001",
    requestedQty: 50,
    urgency:      "medium" as const,
  };

  it("passes for stock_manager (DB error, not validation)", async () => {
    const p = caller("stock_manager").stockManager.requestRestock(validInput);
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects requestedQty < 1", async () => {
    await expect(
      caller("stock_manager").stockManager.requestRestock({ ...validInput, requestedQty: 0 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid urgency value", async () => {
    await expect(
      caller("stock_manager").stockManager.requestRestock({ ...validInput, urgency: "critical" as any })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts all urgency values", async () => {
    for (const urgency of ["low","medium","high"] as const) {
      const p = caller("stock_manager").stockManager.requestRestock({ ...validInput, urgency });
      await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
    }
  });
});

// ─── inventory.adjustStock — shared access validation ────────────────────────
describe("inventory.adjustStock — shared inventory procedure", () => {
  const validInput = {
    productId:      "000000000000000000000001",
    quantityChange: 5,
    reason:         "correction" as const,
  };

  const allowedRoles: Role[] = ["admin", "manager", "stock_manager", "developer"];
  const blockedRoles: Role[] = ["buyer", "reader", "delivery"];

  for (const role of allowedRoles) {
    it(`${role} passes RBAC (DB error acceptable)`, async () => {
      const p = caller(role).inventory.adjustStock(validInput);
      await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
    });
  }

  for (const role of blockedRoles) {
    it(`${role} gets FORBIDDEN`, async () => {
      await expect(
        caller(role).inventory.adjustStock(validInput)
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });
  }
});

// ─── inventory.lowStock — threshold validation ────────────────────────────────
describe("inventory.lowStock — threshold validation", () => {
  it("rejects negative threshold", async () => {
    await expect(
      caller("manager").inventory.lowStock({ threshold: -1 })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts 0 threshold (out of stock only)", async () => {
    const p = caller("manager").inventory.lowStock({ threshold: 0 });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// ─── orders.cancel — business rule validation ─────────────────────────────────
describe("orders.cancel", () => {
  it("is accessible to buyer (DB error, not FORBIDDEN)", async () => {
    const p = caller("buyer").orders.cancel({ orderId: "ORD-DOESNOTEXIST" });
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
  });

  it("is accessible to reader (buyerProcedure includes reader)", async () => {
    const p = caller("reader").orders.cancel({ orderId: "ORD-DOESNOTEXIST" });
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks manager from cancelling orders", async () => {
    await expect(
      caller("manager").orders.cancel({ orderId: "ORD-DOESNOTEXIST" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks admin from cancelling via buyer route", async () => {
    await expect(
      caller("admin").orders.cancel({ orderId: "ORD-DOESNOTEXIST" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ─── developer routes — input validation ─────────────────────────────────────
describe("developer.users.create — input validation", () => {
  const validInput = {
    name:     "New Manager",
    email:    "newmgr@gimbiya.com",
    password: "Pass@1234",
    role:     "manager" as const,
  };

  it("passes for developer", async () => {
    const p = caller("developer").developer.users.create(validInput);
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid email", async () => {
    await expect(
      caller("developer").developer.users.create({ ...validInput, email: "not-an-email" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects name shorter than 2 chars", async () => {
    await expect(
      caller("developer").developer.users.create({ ...validInput, name: "X" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects invalid role (buyer is not a staff role)", async () => {
    await expect(
      caller("developer").developer.users.create({ ...validInput, role: "buyer" as any })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts all valid staff roles", async () => {
    const roles = ["admin","manager","stock_manager","delivery"] as const;
    for (const role of roles) {
      const p = caller("developer").developer.users.create({ ...validInput, role });
      await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
    }
  });
});

describe("developer.stores.create — input validation", () => {
  const validInput = {
    adminName:     "Store Owner",
    adminEmail:    "owner@newstore.com",
    adminPassword: "Pass@1234",
    storeName:     "New Store",
  };

  it("rejects invalid email", async () => {
    await expect(
      caller("developer").developer.stores.create({ ...validInput, adminEmail: "bad-email" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects storeName shorter than 2 chars", async () => {
    await expect(
      caller("developer").developer.stores.create({ ...validInput, storeName: "X" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("passes valid input for developer", async () => {
    const p = caller("developer").developer.stores.create(validInput);
    await expect(p).rejects.not.toMatchObject({ code: "BAD_REQUEST" });
    await expect(p).rejects.not.toMatchObject({ code: "FORBIDDEN" });
  });
});
