import express from "express";
import { ApolloServer, gql } from "apollo-server-express"; // ✅ both from same package
import { v4 as uuidv4 } from "uuid";

// -----------------
// 1. Define Schema
// -----------------
const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type List {
    id: ID!
    title: String!
    tasks: [Task!]!
  }

  type Board {
    id: ID!
    title: String!
    lists: [List!]!
  }

  type Query {
    boards: [Board!]!
  }

  type Mutation {
    addBoard(title: String!): Board!
    updateBoard(id: ID!, title: String!): Board!
    deleteBoard(id: ID!): Boolean!

    addList(boardId: ID!, title: String!): List!
    updateList(id: ID!, title: String!): List!
    deleteList(id: ID!): Boolean!

    addTask(listId: ID!, title: String!): Task!
    updateTask(id: ID!, title: String!): Task!
    deleteTask(id: ID!): Boolean!

    toggleTaskCompletion(taskId: ID!): Task!
    moveTask(
      taskId: ID!
      sourceListId: ID!
      destListId: ID!
      newIndex: Int!
    ): [Board!]! # return updated boards
  }
`;

// -----------------
// 2. Data Store
// -----------------
let boards: {
  id: string;
  title: string;
  lists: {
    id: string;
    title: string;
    tasks: { id: string; title: string; completed: boolean }[];
  }[];
}[] = [];

// -----------------
// 3. Resolvers
// -----------------
const resolvers = {
  Query: {
    boards: () => boards,
  },
  Mutation: {
    // --------- Board ---------
    addBoard: (_: any, { title }: { title: string }) => {
      const newBoard = { id: uuidv4(), title, lists: [] };
      boards.push(newBoard);
      return newBoard;
    },
    updateBoard: (_: any, { id, title }: { id: string; title: string }) => {
      const board = boards.find((b) => b.id === id);
      if (!board) throw new Error("Board not found");
      board.title = title;
      return board;
    },
    deleteBoard: (_: any, { id }: { id: string }) => {
      const index = boards.findIndex((b) => b.id === id);
      if (index === -1) return false;
      boards.splice(index, 1);
      return true;
    },

    // --------- List ---------
    addList: (
      _: any,
      { boardId, title }: { boardId: string; title: string }
    ) => {
      const board = boards.find((b) => b.id === boardId);
      if (!board) throw new Error("Board not found");
      const newList = { id: uuidv4(), title, tasks: [] };
      board.lists.push(newList);
      return newList;
    },
    updateList: (_: any, { id, title }: { id: string; title: string }) => {
      for (const board of boards) {
        const list = board.lists.find((l) => l.id === id);
        if (list) {
          list.title = title;
          return list;
        }
      }
      throw new Error("List not found");
    },
    deleteList: (_: any, { id }: { id: string }) => {
      for (const board of boards) {
        const index = board.lists.findIndex((l) => l.id === id);
        if (index !== -1) {
          board.lists.splice(index, 1);
          return true;
        }
      }
      return false;
    },

    // --------- Task ---------
    addTask: (_: any, { listId, title }: { listId: string; title: string }) => {
      for (const board of boards) {
        const list = board.lists.find((l) => l.id === listId);
        if (list) {
          const newTask = { id: uuidv4(), title, completed: false };
          list.tasks.push(newTask);
          return newTask;
        }
      }
      throw new Error("List not found");
    },
    updateTask: (_: any, { id, title }: { id: string; title: string }) => {
      for (const board of boards) {
        for (const list of board.lists) {
          const task = list.tasks.find((t) => t.id === id);
          if (task) {
            task.title = title;
            return task;
          }
        }
      }
      throw new Error("Task not found");
    },
    deleteTask: (_: any, { id }: { id: string }) => {
      for (const board of boards) {
        for (const list of board.lists) {
          const index = list.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            list.tasks.splice(index, 1);
            return true;
          }
        }
      }
      return false;
    },

    // --------- Toggle ---------
    toggleTaskCompletion: (_: any, { taskId }: { taskId: string }) => {
      for (const board of boards) {
        for (const list of board.lists) {
          const task = list.tasks.find((t) => t.id === taskId);
          if (task) {
            task.completed = !task.completed;
            return task;
          }
        }
      }
      throw new Error("Task not found");
    },

    // --------- Move ---------
    moveTask: (
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
      }
    ) => {
      let movedTask = null;

      // remove from source
      for (const board of boards) {
        const sourceList = board.lists.find((l) => l.id === sourceListId);
        if (sourceList) {
          const taskIndex = sourceList.tasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            [movedTask] = sourceList.tasks.splice(taskIndex, 1);
          }
        }
      }
      if (!movedTask) throw new Error("Task not found");

      // insert into destination
      for (const board of boards) {
        const destList = board.lists.find((l) => l.id === destListId);
        if (destList) {
          destList.tasks.splice(newIndex, 0, movedTask);
        }
      }

      return boards;
    },
  },
};

// -----------------
// 4. Start Server
// -----------------
async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
