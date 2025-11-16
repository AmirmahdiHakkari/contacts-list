import "dotenv/config";
import express from "express";
import { router as contactRouter } from "./modules/contacts/routes.js";

const app = express();

app.use(express.json());

app.use("/contact", contactRouter);

app.get("/", (req, res) => {
  res.json({ message: "Contact API is running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
