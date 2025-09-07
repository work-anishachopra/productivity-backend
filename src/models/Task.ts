import mongoose, { Schema, Document, Types } from "mongoose";
import { IList } from "./List";

export interface ITask extends Document {
  _id: Types.ObjectId; // 👈 force ObjectId
  title: string;
  completed: boolean;
  listId: Types.ObjectId | IList;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
});

export default mongoose.model<ITask>("Task", TaskSchema);
