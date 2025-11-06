import "dotenv/config"; // loads .env
import { app } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";

async function main() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(
      `🔐 Auth endpoints:      http://localhost:${env.PORT}/api/auth`
    );
    console.log(
      `📚 Subjects endpoints:  http://localhost:${env.PORT}/api/subjects`
    );
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
