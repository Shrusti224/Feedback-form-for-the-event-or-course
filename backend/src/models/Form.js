import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "rating", "mcq", "multi"],
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
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
