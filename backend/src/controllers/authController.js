import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ adminId: admin._id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return res.json({ token, admin: { email: admin.email } });
  } catch (error) {
    return next(error);
  }
};