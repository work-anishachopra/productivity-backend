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
// 2. Define Resolvers
// ------------------

let boards: {
  id: string;
  title: string;
  lists: {
    id: string;
    title: string;
    tasks: { id: string; title: string; completed: boolean }[];
  }[];
}[] = [
  {
    id: "1",
    title: "Personal",
    lists: [
      { id: "1", title: "To Do", tasks: [] },
      { id: "2", title: "Done", tasks: [] },
    ],
  },
  {
    id: "2",
    title: "Work",
    lists: [
      { id: "3", title: "Backlog", tasks: [] },
      { id: "4", title: "In Progress", tasks: [] },
    ],
  },
  {
    id: "3",
    title: "Projects",
    lists: [
      { id: "5", title: "Ideas", tasks: [] },
      { id: "6", title: "Completed", tasks: [] },
    ],
  },
];

const resolvers = {
  Query: {
    boards: () => boards,
  },
  Mutation: {
    addBoard: (_: any, { title }: { title: string }) => {
      const newBoard = { id: String(boards.length + 1), title, lists: [] };
      boards.push(newBoard);
      return newBoard;
    },
    addList: (
      _: any,
      { boardId, title }: { boardId: string; title: string }
    ) => {
      const board = boards.find((b) => b.id === boardId);
      if (!board) throw new Error("Board not found");
      const newList = { id: String(board.lists.length + 1), title, tasks: [] };
      board.lists.push(newList);
      return newList;
    },
    addTask: (_: any, { listId, title }: { listId: string; title: string }) => {
      for (const board of boards) {
        const list = board.lists.find((l) => l.id === listId);
        if (list) {
          const newTask = {
            id: String(list.tasks.length + 1),
            title,
            completed: false,
          };
          list.tasks.push(newTask);
          return newTask;
        }
      }
      throw new Error("List not found");
    },
    toggleTask: (_: any, { id }: { id: string }) => {
      for (const board of boards) {
        for (const list of board.lists) {
          const task = list.tasks.find((t) => t.id === id);
          if (task) {
            task.completed = !task.completed;
            return task;
          }
        }
      }
      return null;
    },
  },
};

// -----------------
// 3. Start Server
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
