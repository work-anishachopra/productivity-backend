import jwt from "jsonwebtoken";
import { Request } from "express";
import { Context } from "./models/types";
import User from "./models/User"; // ✅ optional if you want to fetch full user

const JWT_SECRET = process.env.JWT_SECRET || "password@anisha";

export async function getUserFromToken(
  req: Request
): Promise<Context["user"] | null> {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // ✅ Option 1: return only ID (if resolvers only need id)
      return { id: decoded.userId };

      // ✅ Option 2 (better): fetch from DB if more fields are required
      // const user = await User.findById(decoded.userId);
      // return user ? { id: user.id, email: user.email, name: user.name } : null;
    } catch (err) {
      console.error("JWT verification failed:", err);
      return null;
    }
  }
  return null;
}
