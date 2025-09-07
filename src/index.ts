import dotenv from "dotenv";
dotenv.config();

console.log("Mongo URI from env:", process.env.MONGO_URI);

import express from "express";
import cors from "cors"; // ✅ added
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./auth";
import { connectDB } from "./mongodb";

async function startServer() {
  // ✅ Ensure DB connects before server start
  await connectDB();

  const app = express();
  app.use(cors()); // ✅ added to avoid CORS issues

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // ✅ req is passed correctly
      const user = getUserFromToken(req);
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
