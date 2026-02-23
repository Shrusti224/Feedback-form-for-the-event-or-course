import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    questionType: {
      type: String,
      enum: ["text", "rating", "mcq", "multi"],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    answers: { type: [answerSchema], required: true },
    userType: {
      type: String,
      enum: ["anonymous", "email", "logged-in"],
      default: "anonymous",
    },
    respondentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const Response = mongoose.model("Response", responseSchema);
