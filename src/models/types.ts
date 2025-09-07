import { Types } from "mongoose";

export type Task = {
  id: Types.ObjectId; // 👈 use ObjectId instead of string
  title: string;
  completed: boolean;
  listId?: Types.ObjectId; // reference to parent List
};

export type List = {
  id: Types.ObjectId;
  title: string;
  tasks: Types.ObjectId[]; // store only ObjectIds, populate gives full Task[]
  boardId?: Types.ObjectId; // reference to parent Board
};

export type Board = {
  id: Types.ObjectId;
  title: string;
  lists: Types.ObjectId[]; // store only ObjectIds, populate gives full List[]
  userId: Types.ObjectId; // owner of the board
};

export type User = {
  id: Types.ObjectId;
  username: string;
  password: string;
};

// Context passed into resolvers
export type Context = {
  user?: {
    id: Types.ObjectId; // ✅ matches JWT + DB ObjectId
    username?: string;
  };
};
