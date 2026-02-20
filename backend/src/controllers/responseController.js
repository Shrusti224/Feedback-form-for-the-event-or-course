import { stringify } from "csv-stringify/sync";
import { Form } from "../models/Form.js";
import { Response } from "../models/Response.js";

const normalizeAnswers = (form, answers) => {
  return form.questions.map((q, index) => {
    const match = answers.find((item) => item.questionIndex === index);
    return match ? match.value : "";
  });
};

export const createResponse = async (req, res, next) => {
  try {
    const { answers, userType } = req.body;
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    if (!form.isActive) {
      return res.status(400).json({ message: "Form Closed" });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    const response = await Response.create({
      formId: req.params.formId,
      answers,
      userType: userType || "anonymous",
    });

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
};

export const getResponsesByForm = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.formId).lean();
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Response.find({ formId: req.params.formId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Response.countDocuments({ formId: req.params.formId }),
    ]);

    if (req.query.format === "csv") {
      const columns = ["submittedAt", "userType", ...form.questions.map((q, index) => `Q${index + 1}:${q.label}`)];
      const records = items.map((r) => [r.createdAt, r.userType, ...normalizeAnswers(form, r.answers)]);
      const csv = stringify([columns, ...records]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=form-${req.params.formId}-responses.csv`);
      return res.status(200).send(csv);
    }

    return res.json({
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};