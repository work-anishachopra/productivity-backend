import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBoard extends Document {
  title: string;
  userId: Types.ObjectId;
  lists: Types.ObjectId[];
}

const BoardSchema = new Schema<IBoard>({
  title: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lists: [{ type: Schema.Types.ObjectId, ref: "List" }],
});

export default mongoose.model<IBoard>("Board", BoardSchema);
