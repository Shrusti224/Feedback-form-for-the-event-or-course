import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "rating", "mcq"],
      required: true,
    },
    label: { type: String, required: true, trim: true },
    required: { type: Boolean, default: true },
    options: [{ type: String, trim: true }],
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one question is required",
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);