const { getDatabase } = require('../../database/simple-db');

const db = getDatabase();

const resolvers = {
  Query: {
    user: (_, { id }) => {
      return db.getUser(parseInt(id));
    },

    products: (_, { category, limit = 10, offset = 0 }) => {
      return db.getProducts(category, limit, offset);
    },

    userOrders: (_, { userId }) => {
      return db.getUserOrders(parseInt(userId));
    }
  },

  Mutation: {
    createUser: (_, { input }) => {
      const { name, email } = input;
      return db.createUser(name, email);
    },

    createOrder: (_, { input }) => {
      const { user_id, items } = input;
      return db.createOrder(parseInt(user_id), items);
    }
  }
};

module.exports = resolvers;