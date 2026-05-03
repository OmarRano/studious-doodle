import { router, publicProcedure } from "./_core/trpc";
import { buyerProcedure } from "./rbac";
import { z } from "zod";
import { initiateMonnifyPayment, verifyMonnifyPayment, getMonnifyTransactionDetails } from "./monnify";
import { getDb, getOrderByOrderId } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const paymentRouter = router({
  /**
   * Initiate a payment for an order
   */
  initiatePayment: buyerProcedure
    .input(z.object({
      orderId: z.string(),
      redirectUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get order details
      const order = await getOrderByOrderId(input.orderId);
      if (!order) throw new Error("Order not found");

      if (order.buyerId !== ctx.user.id) {
        throw new Error("Unauthorized: Order does not belong to this user");
      }

      // Generate transaction reference
      const transactionRef = `TXN-${nanoid(12)}`;

      try {
        // Initiate payment with Monnify
        const paymentResponse = await initiateMonnifyPayment({
          amount: parseFloat(order.finalAmount.toString()),
          customerName: ctx.user.name || "Customer",
          customerEmail: ctx.user.email || "",
          paymentReference: order.orderId,
          paymentDescription: `Payment for Order ${order.orderId}`,
          currencyCode: "NGN",
          contractCode: process.env.MONNIFY_CONTRACT_CODE || "",
          redirectUrl: input.redirectUrl,
          metadata: {
            orderId: order.id,
            userId: ctx.user.id,
            transactionReference: transactionRef,
          },
        });

        if (!paymentResponse.requestSuccessful) {
          throw new Error(paymentResponse.responseMessage);
        }

        // Update order with payment status
        await db.update(orders)
          .set({
            paymentStatus: "pending",
          })
          .where(eq(orders.id, order.id));

        return {
          success: true,
          transactionReference: transactionRef,
          paymentLink: paymentResponse.responseBody?.checkoutUrl,
          accessToken: paymentResponse.responseBody?.accessToken,
        };
      } catch (error: any) {
        console.error("[Payment] Initiation failed:", error);
        throw new Error(`Payment initiation failed: ${error.message}`);
      }
    }),

  /**
   * Verify payment status
   */
  verifyPayment: buyerProcedure
    .input(z.object({
      transactionReference: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const paymentDetails = await getMonnifyTransactionDetails(input.transactionReference);

        if (!paymentDetails) {
          throw new Error("Payment details not found");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Update order payment status based on verification
        if (paymentDetails.paymentStatus === "PAID") {
          const orderList = await db.select().from(orders)
            .limit(1);

          if (orderList.length > 0) {
            await db.update(orders)
              .set({
                paymentStatus: "completed",
                status: "paid",
              })
              .where(eq(orders.id, orderList[0].id));
          }
        }

        return {
          success: true,
          status: paymentDetails.paymentStatus,
          amount: paymentDetails.amountPaid,
          transactionReference: paymentDetails.transactionReference,
          paidOn: paymentDetails.paidOn,
        };
      } catch (error: any) {
        console.error("[Payment] Verification failed:", error);
        throw new Error(`Payment verification failed: ${error.message}`);
      }
    }),

  /**
   * Get payment history for a buyer
   */
  getPaymentHistory: buyerProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select().from(orders)
        .where(eq(orders.buyerId, ctx.user.id))
        .limit(input.limit)
        .offset(input.offset);

      return result.map(order => ({
        orderId: order.orderId,
        amount: order.finalAmount,
        status: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.id, // Will be populated by client
      }));
    }),

  /**
   * Get order payment details
   */
  getOrderPayment: publicProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const order = await getOrderByOrderId(input.orderId);
      if (!order) return null;

      return {
        orderId: order.orderId,
        amount: order.finalAmount,
        status: order.paymentStatus,
        createdAt: order.createdAt,
      };
    }),
});
