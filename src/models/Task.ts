import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  completed: boolean;
  listId: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
});

export default mongoose.model<ITask>("Task", TaskSchema);
