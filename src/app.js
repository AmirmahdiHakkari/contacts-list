import express from "express";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { router as contactRouter } from "./modules/contacts/routes.js";
import { router as userRouter } from "./modules/users/routes.js";
import { auth } from "./middlewares/auth.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", userRouter);
app.use("/contact", auth, contactRouter);

app.get("/", (req, res) => {
  res.json({ message: "Contact API is running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
