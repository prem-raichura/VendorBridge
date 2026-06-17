import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./config/prisma";
import app from "./app";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
