import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { User, type IUser } from "../models/User";
import { getSessionToken, verifySessionToken } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: IUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: IUser | null = null;

  try {
    const token = getSessionToken(opts.req);
    const session = await verifySessionToken(token);

    if (session?.userId) {
      user = (await User.findById(session.userId).lean<IUser>()) ?? null;
      if (user) {
        // Touch lastSignedIn in background
        User.findByIdAndUpdate(session.userId, { lastSignedIn: new Date() }).exec();
      }
    }
  } catch {
    user = null;
  }

  return { req: opts.req, res: opts.res, user };
}
