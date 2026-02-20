import { Router } from "express";
import {
  createForm,
  deleteForm,
  getFormById,
  getForms,
  getFormSummary,
  updateForm,
  updateFormStatus,
} from "../controllers/formController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, createForm);
router.get("/", authMiddleware, getForms);
router.get("/:id", getFormById);
router.put("/:id", authMiddleware, updateForm);
router.patch("/:id/status", authMiddleware, updateFormStatus);
router.delete("/:id", authMiddleware, deleteForm);
router.get("/:id/summary", authMiddleware, getFormSummary);

export default router;