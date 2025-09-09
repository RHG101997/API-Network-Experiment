const axios = require('axios');

class RestClient {
  constructor(baseUrl = process.env.REST_URL || 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }
  async createUser(name, email) {
    const response = await axios.post(`${this.baseUrl}/users`, { name, email });
    return response.data;
  }

  async getUser(id) {
    const response = await axios.get(`${this.baseUrl}/users/${id}`);
    return response.data;
  }

  async getProducts(category = null, limit = 10, offset = 0) {
    const params = { limit, offset };
    if (category) params.category = category;
    
    const response = await axios.get(`${this.baseUrl}/products`, { params });
    return response.data;
  }

  async createOrder(user_id, items) {
    const response = await axios.post(`${this.baseUrl}/orders`, { user_id, items });
    return response.data;
  }

  async getUserOrders(userId) {
    const response = await axios.get(`${this.baseUrl}/users/${userId}/orders`);
    return response.data;
  }
}

module.exports = RestClient;