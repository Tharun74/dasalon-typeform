import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubmission extends Document {
  formId: string;
  answers: Record<string, any>;
  createdAt: Date;
}

const SubmissionSchema = new Schema(
  {
    formId: { type: String, required: true },
    answers: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema);
