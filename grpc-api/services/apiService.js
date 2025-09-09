const { getDatabase } = require('../../database/simple-db');

const db = getDatabase();

const apiService = {
  createUser: (call, callback) => {
    try {
      const { name, email } = call.request;
      const user = db.createUser(name, email);
      callback(null, user);
    } catch (error) {
      callback(error);
    }
  },

  getUser: (call, callback) => {
    try {
      const { id } = call.request;
      const user = db.getUser(parseInt(id));
      
      if (!user) {
        return callback(new Error('User not found'));
      }
      
      callback(null, user);
    } catch (error) {
      callback(error);
    }
  },

  getProducts: (call, callback) => {
    try {
      const { category, limit = 10, offset = 0 } = call.request;
      const products = db.getProducts(category, limit, offset);
      callback(null, { products });
    } catch (error) {
      callback(error);
    }
  },

  createOrder: (call, callback) => {
    try {
      const { user_id, items } = call.request;
      const order = db.createOrder(parseInt(user_id), items);
      callback(null, order);
    } catch (error) {
      callback(error);
    }
  },

  getUserOrders: (call, callback) => {
    try {
      const { user_id } = call.request;
      const orders = db.getUserOrders(parseInt(user_id));
      callback(null, { orders });
    } catch (error) {
      callback(error);
    }
  }
};

module.exports = apiService;