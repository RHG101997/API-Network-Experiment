const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    created_at: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    category: String!
    created_at: String!
  }

  type OrderItem {
    product_id: ID!
    product_name: String!
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    user_id: ID!
    total_amount: Float!
    created_at: String!
    items: [OrderItem!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreateOrderInput {
    user_id: ID!
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    product_id: ID!
    quantity: Int!
  }

  type Query {
    user(id: ID!): User
    products(category: String, limit: Int = 10, offset: Int = 0): [Product!]!
    userOrders(userId: ID!): [Order!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createOrder(input: CreateOrderInput!): Order!
  }
`;

module.exports = typeDefs;