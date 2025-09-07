import mongoose, { Schema, Document, Types } from "mongoose";
import { ITask } from "./Task";
import { IBoard } from "./Board";

export interface IList extends Document {
  _id: Types.ObjectId; // 👈 force ObjectId
  title: string;
  tasks: Types.ObjectId[] | ITask[];
  boardId: Types.ObjectId | IBoard;
}

const ListSchema: Schema = new Schema({
  title: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
});

export default mongoose.model<IList>("List", ListSchema);
