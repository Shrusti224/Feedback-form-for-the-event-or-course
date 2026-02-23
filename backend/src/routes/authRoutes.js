import { Router } from "express";
import { loginAdmin, signupAdmin } from "../controllers/authController.js";

const router = Router();

router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);

export default router;
