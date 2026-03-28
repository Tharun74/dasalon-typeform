import mongoose, { Schema, Document } from "mongoose";

export interface IForm extends Document {
  id: string; // The custom nanoid for form linking
  title: string;
  description: string;
  questions: any[];
  createdAt: Date;
}

const FormSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    questions: { type: Array, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);
