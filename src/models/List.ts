import mongoose, { Document, Schema, Types } from "mongoose";

export interface IList extends Document {
  title: string;
  boardId: Types.ObjectId;
  tasks: Types.ObjectId[];
}

const ListSchema = new Schema<IList>({
  title: { type: String, required: true },
  boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

export default mongoose.model<IList>("List", ListSchema);
