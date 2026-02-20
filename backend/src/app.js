import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";
import { errorMiddleware } from "./middleware/error.js";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

app.use(errorMiddleware);