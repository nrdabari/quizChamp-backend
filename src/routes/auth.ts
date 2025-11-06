import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, register } from "../controllers/auth.controller";

const r = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

r.post("/login", authLimiter, login);
r.post("/register", authLimiter, register);

export default r;
