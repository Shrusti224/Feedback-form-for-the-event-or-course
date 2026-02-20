import { Router } from "express";
import { createResponse, getResponsesByForm } from "../controllers/responseController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/:formId", createResponse);
router.get("/:formId", authMiddleware, getResponsesByForm);

export default router;