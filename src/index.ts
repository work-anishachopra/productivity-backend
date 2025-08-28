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

  type Board {
    id: ID!
    name: String!
  }

  type Query {
    tasks: [Task!]!
    boards: [Board!]!
  }

  type Mutation {
    addTask(title: String!): Task!
    toggleTask(id: ID!): Task
  }
`;

// -----------------
// 2. Define Resolvers
// -----------------
let tasks: { id: string; title: string; completed: boolean }[] = [];

let boards: { id: string; name: string }[] = [
  { id: "1", name: "Personal" },
  { id: "2", name: "Work" },
  { id: "3", name: "Projects" },
];

const resolvers = {
  Query: {
    tasks: () => tasks,
    boards: () => boards,
  },
  Mutation: {
    addTask: (_: any, { title }: { title: string }) => {
      const newTask = {
        id: String(tasks.length + 1),
        title,
        completed: false,
      };
      tasks.push(newTask);
      return newTask;
    },
    toggleTask: (_: any, { id }: { id: string }) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.completed = !task.completed;
      }
      return task;
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
