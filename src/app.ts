import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFound } from './middleware/errors';



export const app = express();

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================
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

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" })); // replaces bodyParser.json()
app.use(cookieParser());
app.use(morgan("combined"));

// If you want to apply: app.use('/api/auth', authLimiter);

// =============================================================================
// STATIC FILES
// IMPORTANT: __dirname points to compiled 'dist' at runtime.
// Use project root by resolving two levels up from dist/src to the repo root.
// =============================================================================
const projectRoot = path.resolve(__dirname, "..", ".."); // adjust if needed
app.use("/data", express.static(path.join(projectRoot, "server", "data")));
app.use(
  "/uploads",
  express.static(path.join(projectRoot, "server", "uploads"))
);

// =============================================================================
// ROUTES (kept in their current JS location for now)
// From src/* (compiled to dist/*), reaching ../routes/*
// If your routes are actually in server/routes, change the paths accordingly.
// =============================================================================
function safeMount(route: string, mount: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const r = require(route);
    app.use(mount, r);
    console.log(`✅ Loaded ${mount} from ${route}`);
  } catch (err: any) {
    console.log(`❌ Error loading ${mount} from ${route}:`, err.message);
  }
}

app.use(notFound);
app.use(errorHandler);

safeMount("../routes/authRoutes", "/api/auth");
safeMount("../routes/subjectRoutes", "/api/subjects");
safeMount("../routes/chapterRoutes", "/api/chapters");
safeMount("../routes/exerciseRoutes", "/api/exercises");
safeMount("../routes/questionRoutes", "/api/questions");
safeMount("../routes/userRoutes", "/api/users");
safeMount("../routes/submissionRoutes", "/api/submissions");
safeMount("../routes/practiceRoutes", "/api/practices");
safeMount("../routes/taskRoutes", "/api/tasks");
import authTs from "./routes/auth";
app.use("/api/auth", authTs);

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});
