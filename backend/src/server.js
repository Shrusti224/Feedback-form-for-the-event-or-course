import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { Admin } from "./models/Admin.js";

dotenv.config();

const ensureAdminSeed = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const existing = await Admin.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email, passwordHash });
  console.log("Default admin created");
};

const start = async () => {
  await connectDB();
  await ensureAdminSeed();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start();