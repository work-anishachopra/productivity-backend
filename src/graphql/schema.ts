import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

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
    userId: ID!
  }

  type Query {
    me: User
    boards: [Board!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!

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
    ): [Board!]!
  }
`;
