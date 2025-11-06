import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthUser {
  id: string;
  role: "admin" | "user";
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ success: false, message: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      role: AuthUser["role"];
      email: string;
    };
    req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export function requireRole(role: AuthUser["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Auth required" });
    if (req.user.role !== role)
      return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
}
