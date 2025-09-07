import mongoose, { Schema, Document, Types } from "mongoose";
import { IList } from "./List";

export interface IBoard extends Document {
  _id: Types.ObjectId; // 👈 force ObjectId
  title: string;
  lists: Types.ObjectId[] | IList[];
  userId: Types.ObjectId;
}

const BoardSchema: Schema = new Schema({
  title: { type: String, required: true },
  lists: [{ type: Schema.Types.ObjectId, ref: "List" }],
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.model<IBoard>("Board", BoardSchema);
