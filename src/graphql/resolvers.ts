import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import Board from "../models/Board";
import List from "../models/List";
import Task from "../models/Task";
import { Context } from "../models/types";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) return null;
      return User.findById(context.user.id);
    },

    boards: async (_: any, __: any, context: Context) => {
      if (!context.user) throw new Error("Not authenticated");
      return Board.find({ userId: context.user.id }).populate({
        path: "lists",
        populate: { path: "tasks" },
      });
    },
  },

  Mutation: {
    login: async (
      _: any,
      { username, password }: { username: string; password: string }
    ) => {
      const user = await User.findOne({ username });
      if (!user || user.password !== password) {
        throw new Error("Invalid username or password");
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      return {
        token,
        user,
      };
    },

    addBoard: async (
      _: any,
      { title }: { title: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const board = new Board({ title, userId: context.user.id, lists: [] });
      await board.save();
      return board;
    },

    updateBoard: async (
      _: any,
      { id, title }: { id: string; title: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const board = await Board.findOne({ _id: id, userId: context.user.id });
      if (!board) throw new Error("Board not found");
      board.title = title;
      await board.save();
      return board;
    },

    deleteBoard: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated");
      const deleted = await Board.deleteOne({
        _id: id,
        userId: context.user.id,
      });
      return deleted.deletedCount === 1;
    },

    addList: async (
      _: any,
      { boardId, title }: { boardId: string; title: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const board = await Board.findOne({
        _id: boardId,
        userId: context.user.id,
      });
      if (!board) throw new Error("Board not found");

      const list = new List({ title, boardId: board._id, tasks: [] });
      await list.save();

      board.lists.push(list._id);
      await board.save();

      return list;
    },

    updateList: async (
      _: any,
      { id, title }: { id: string; title: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const list = await List.findById(id).populate("boardId");
      if (!list || list.boardId.userId.toString() !== context.user.id)
        throw new Error("List not found");
      list.title = title;
      await list.save();
      return list;
    },

    deleteList: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated");
      const list = await List.findById(id).populate("boardId");
      if (!list || list.boardId.userId.toString() !== context.user.id)
        throw new Error("List not found");

      // Remove list ref from board
      await Board.updateOne(
        { _id: list.boardId._id },
        { $pull: { lists: list._id } }
      );
      await list.deleteOne();

      return true;
    },

    addTask: async (
      _: any,
      { listId, title }: { listId: string; title: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const list = await List.findById(listId).populate({
        path: "boardId",
      });
      if (!list || list.boardId.userId.toString() !== context.user.id)
        throw new Error("List not found");

      const task = new Task({ title, completed: false, listId: list._id });
      await task.save();

      list.tasks.push(task._id);
      await list.save();

      return task;
    },

    updateTask: async (
      _: any,
      { id, title }: { id: string; title: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const task = await Task.findById(id).populate({
        path: "listId",
        populate: { path: "boardId" },
      });
      if (!task || task.listId.boardId.userId.toString() !== context.user.id)
        throw new Error("Task not found");
      task.title = title;
      await task.save();
      return task;
    },

    deleteTask: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) throw new Error("Not authenticated");
      const task = await Task.findById(id).populate({
        path: "listId",
        populate: { path: "boardId" },
      });
      if (!task || task.listId.boardId.userId.toString() !== context.user.id)
        throw new Error("Task not found");

      // Remove task ref from list
      await List.updateOne(
        { _id: task.listId._id },
        { $pull: { tasks: task._id } }
      );
      await task.deleteOne();

      return true;
    },

    toggleTaskCompletion: async (
      _: any,
      { taskId }: { taskId: string },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");
      const task = await Task.findById(taskId).populate({
        path: "listId",
        populate: { path: "boardId" },
      });
      if (!task || task.listId.boardId.userId.toString() !== context.user.id)
        throw new Error("Task not found");
      task.completed = !task.completed;
      await task.save();
      return task;
    },

    moveTask: async (
      _: any,
      {
        taskId,
        sourceListId,
        destListId,
        newIndex,
      }: {
        taskId: string;
        sourceListId: string;
        destListId: string;
        newIndex: number;
      },
      context: Context
    ) => {
      if (!context.user) throw new Error("Not authenticated");

      const task = await Task.findById(taskId).populate({
        path: "listId",
        populate: { path: "boardId" },
      });
      if (!task || task.listId.boardId.userId.toString() !== context.user.id)
        throw new Error("Task not found");

      // Remove task from source list
      await List.updateOne(
        { _id: sourceListId },
        { $pull: { tasks: task._id } }
      );

      // Add task to destination list at specified index
      const destList = await List.findById(destListId);
      if (!destList) throw new Error("Destination list not found");

      destList.tasks.splice(newIndex, 0, task._id);
      task.listId = destList._id;

      await destList.save();
      await task.save();

      // Return updated boards for user
      return Board.find({ userId: context.user.id }).populate({
        path: "lists",
        populate: { path: "tasks" },
      });
    },
  },
};
