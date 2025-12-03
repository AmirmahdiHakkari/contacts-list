import express from "express";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { router as contactRouter } from "./modules/contacts/routes.js";
import { router as userRouter } from "./modules/users/routes.js";
import { auth } from "./middlewares/auth.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import { requestContext } from "./middlewares/requestContext.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import { logger } from "./config/logger.js";

const app = express();

app.use(express.json());

app.use(requestContext);

app.use(httpLogger);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", userRouter);
app.use("/contacts", auth, contactRouter);

app.get("/", (req, res) => {
  res.json({ message: "Contact API is running" });
});

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", { err });
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", { err });
  process.exit(1);
});

export default app;
