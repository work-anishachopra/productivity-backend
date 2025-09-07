import jwt from "jsonwebtoken";
import { Request } from "express";
import { Context } from "./models/types";

const JWT_SECRET = process.env.JWT_SECRET || "password@anisha";

export function getUserFromToken(req: Request): Context["user"] | null {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return { id: decoded.userId };
    } catch {
      return null;
    }
  }
  return null;
}
