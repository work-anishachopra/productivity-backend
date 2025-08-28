import express from "express";
import { ApolloServer } from "apollo-server-express";
import { gql } from "apollo-server-core";

// -----------------
// 1. Define Schema
// -----------------
const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    completed: Boolean!
    listId: ID!
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
    addList(boardId: ID!, title: String!): List!
    addTask(listId: ID!, title: String!): Task!
    toggleTask(id: ID!): Task
  }
`;

// -----------------
// 2. Mock Data Store
// -----------------
let boards: {
  id: string;
  title: string;
  lists: {
    id: string;
    title: string;
    tasks: { id: string; title: string; completed: boolean; listId: string }[];
  }[];
}[] = [
  {
    id: "1",
    title: "Personal",
    lists: [
      { id: "1", title: "To Do", tasks: [] },
      { id: "2", title: "In Progress", tasks: [] },
      { id: "3", title: "Done", tasks: [] },
    ],
  },
  {
    id: "2",
    title: "Work",
    lists: [
      { id: "4", title: "To Do", tasks: [] },
      { id: "5", title: "In Progress", tasks: [] },
      { id: "6", title: "Done", tasks: [] },
    ],
  },
];

// -----------------
// 3. Resolvers
// -----------------
const resolvers = {
  Query: {
    boards: () => boards,
  },
  Mutation: {
    addBoard: (_: any, { title }: { title: string }) => {
      const newBoard = { id: String(Date.now()), title, lists: [] };
      boards.push(newBoard);
      return newBoard;
    },
    addList: (
      _: any,
      { boardId, title }: { boardId: string; title: string }
    ) => {
      const board = boards.find((b) => b.id === boardId);
      if (!board) throw new Error("Board not found");

      const newList = { id: String(Date.now()), title, tasks: [] };
      board.lists.push(newList);
      return newList;
    },
    addTask: (_: any, { listId, title }: { listId: string; title: string }) => {
      const list = boards.flatMap((b) => b.lists).find((l) => l.id === listId);
      if (!list) throw new Error("List not found");

      const newTask = {
        id: String(Date.now()),
        title,
        completed: false,
        listId,
      };
      list.tasks.push(newTask);
      return newTask;
    },
    toggleTask: (_: any, { id }: { id: string }) => {
      const task = boards
        .flatMap((b) => b.lists)
        .flatMap((l) => l.tasks)
        .find((t) => t.id === id);

      if (task) {
        task.completed = !task.completed;
      }
      return task;
    },
  },
};

// -----------------
// 4. Start Server
// -----------------
async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

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
