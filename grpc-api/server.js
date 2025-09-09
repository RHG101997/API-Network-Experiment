const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const apiService = require('./services/apiService');

const PROTO_PATH = path.join(__dirname, 'proto', 'api.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const apiProto = grpc.loadPackageDefinition(packageDefinition).api;

function main() {
  const server = new grpc.Server();
  
  server.addService(apiProto.ApiService.service, {
    CreateUser: apiService.createUser,
    GetUser: apiService.getUser,
    GetProducts: apiService.getProducts,
    CreateOrder: apiService.createOrder,
    GetUserOrders: apiService.getUserOrders,
  });

  const PORT = '0.0.0.0:50051';
  server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to start server:', err);
      return;
    }
    console.log(`gRPC API server running on ${PORT}`);
    server.start();
  });
}

main();