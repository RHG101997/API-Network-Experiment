const axios = require('axios');

class GraphQLClient {
  constructor(baseUrl = process.env.this.baseUrl || 'http://localhost:3002/graphql') {
    this.baseUrl = baseUrl;
  }
  async query(query, variables = {}) {
    const response = await axios.post(this.baseUrl, {
      query,
      variables,
    });
    
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data;
  }

  async createUser(name, email) {
    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
          created_at
        }
      }
    `;
    
    const result = await this.query(mutation, { input: { name, email } });
    return result.createUser;
  }

  async getUser(id) {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          created_at
        }
      }
    `;
    
    const result = await this.query(query, { id });
    return result.user;
  }

  async getProducts(category = null, limit = 10, offset = 0) {
    const query = `
      query GetProducts($category: String, $limit: Int, $offset: Int) {
        products(category: $category, limit: $limit, offset: $offset) {
          id
          name
          price
          category
          created_at
        }
      }
    `;
    
    const result = await this.query(query, { category, limit, offset });
    return result.products;
  }

  async createOrder(user_id, items) {
    const mutation = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          user_id
          total_amount
          created_at
          items {
            product_id
            product_name
            quantity
            price
          }
        }
      }
    `;
    
    const result = await this.query(mutation, { input: { user_id, items } });
    return result.createOrder;
  }

  async getUserOrders(userId) {
    const query = `
      query GetUserOrders($userId: ID!) {
        userOrders(userId: $userId) {
          id
          total_amount
          created_at
          items {
            product_id
            product_name
            quantity
            price
          }
        }
      }
    `;
    
    const result = await this.query(query, { userId });
    return result.userOrders;
  }
}

module.exports = GraphQLClient;