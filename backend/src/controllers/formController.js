import { Form } from "../models/Form.js";
import { Response } from "../models/Response.js";
import { calculateFormSummary } from "../utils/analytics.js";

export const createForm = async (req, res, next) => {
  try {
    const { title, description, questions, isActive } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Title and at least one question are required" });
    }

    const form = await Form.create({ title, description, questions, isActive });
    return res.status(201).json(form);
  } catch (error) {
    return next(error);
  }
};

export const getForms = async (req, res, next) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    return res.json(forms);
  } catch (error) {
    return next(error);
  }
};

export const getFormById = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    return res.json(form);
  } catch (error) {
    return next(error);
  }
};

export const updateForm = async (req, res, next) => {
  try {
    const { title, description, questions, isActive } = req.body;
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    form.title = title ?? form.title;
    form.description = description ?? form.description;
    form.isActive = isActive ?? form.isActive;
    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Questions must be a non-empty array" });
      }
      form.questions = questions;
    }

    await form.save();
    return res.json(form);
  } catch (error) {
    return next(error);
  }
};

export const updateFormStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive boolean is required" });
    }

    const form = await Form.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    return res.json(form);
  } catch (error) {
    return next(error);
  }
};

export const deleteForm = async (req, res, next) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    await Response.deleteMany({ formId: req.params.id });
    return res.json({ message: "Form deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getFormSummary = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id).lean();
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const responses = await Response.find({ formId: req.params.id }).sort({ createdAt: -1 }).lean();
    const summary = calculateFormSummary(form, responses);
    return res.json(summary);
  } catch (error) {
    return next(error);
  }
};