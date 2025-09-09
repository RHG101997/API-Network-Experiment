const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../grpc-api/proto/api.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const apiProto = grpc.loadPackageDefinition(packageDefinition).api;

class GRPCClient {
  constructor(address = process.env.GRPC_URL || 'localhost:50051') {
    this.client = new apiProto.ApiService(address, grpc.credentials.createInsecure());
  }

  createUser(name, email) {
    return new Promise((resolve, reject) => {
      this.client.CreateUser({ name, email }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  getUser(id) {
    return new Promise((resolve, reject) => {
      this.client.GetUser({ id }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  getProducts(category = null, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      const request = { limit, offset };
      if (category) request.category = category;
      
      this.client.GetProducts(request, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.products);
        }
      });
    });
  }

  createOrder(user_id, items) {
    return new Promise((resolve, reject) => {
      this.client.CreateOrder({ user_id, items }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  getUserOrders(user_id) {
    return new Promise((resolve, reject) => {
      this.client.GetUserOrders({ user_id }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.orders);
        }
      });
    });
  }
}

module.exports = GRPCClient;