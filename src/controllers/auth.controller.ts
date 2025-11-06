import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { LoginSchema, RegisterSchema } from "../types/schemas";
import { signAccessToken } from "../services/jwt";
import { UserModel } from "../models/user.model";

export async function login(req: Request, res: Response) {
  const data = LoginSchema.parse(req.body);

  const user = await UserModel.findOne({ email: data.email }).lean();
  if (!user?.passwordHash) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = signAccessToken({
    sub: String(user._id),
    role: user.role,
    email: user.email,
  });
  return res.json({
    success: true,
    token,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function register(req: Request, res: Response) {
  const data = RegisterSchema.parse(req.body);

  const exists = await UserModel.exists({ email: data.email });
  if (exists) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const created = await UserModel.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: "user",
  });

  const token = signAccessToken({
    sub: String(created._id),
    role: created.role,
    email: created.email,
  });
  return res.status(201).json({
    success: true,
    token,
    user: {
      id: String(created._id),
      name: created.name,
      email: created.email,
      role: created.role,
    },
  });
}
