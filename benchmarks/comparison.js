const PerformanceTester = require('./performance-test');
const RestClient = require('../clients/rest-client');
const GraphQLClient = require('../clients/graphql-client');
const GRPCClient = require('../clients/grpc-client');

class APIComparison {
  constructor() {
    this.restClient = new RestClient(process.env.REST_URL || 'http://localhost:3001');
    this.graphqlClient = new GraphQLClient(process.env.GRAPHQL_URL || 'http://localhost:3002/graphql');
    this.grpcClient = new GRPCClient(process.env.GRPC_URL || 'localhost:50051');
  }

  async testFunctionality() {
    console.log('=== FUNCTIONALITY TEST ===\n');
    
    try {
      console.log('Testing basic CRUD operations...\n');
      
      console.log('1. Creating users...');
      const restUser = await this.restClient.createUser('REST User', 'rest@test.com');
      const gqlUser = await this.graphqlClient.createUser('GraphQL User', 'graphql@test.com');
      const grpcUser = await this.grpcClient.createUser('gRPC User', 'grpc@test.com');
      
      console.log('✅ All APIs successfully created users');
      
      console.log('2. Retrieving users...');
      await this.restClient.getUser(1);
      await this.graphqlClient.getUser(1);
      await this.grpcClient.getUser(1);
      
      console.log('✅ All APIs successfully retrieved users');
      
      console.log('3. Listing products...');
      await this.restClient.getProducts('Electronics', 3);
      await this.graphqlClient.getProducts('Electronics', 3);
      await this.grpcClient.getProducts('Electronics', 3);
      
      console.log('✅ All APIs successfully listed products');
      
      console.log('4. Creating orders...');
      const orderItems = [
        { product_id: 1, quantity: 1 },
        { product_id: 2, quantity: 2 }
      ];
      
      await this.restClient.createOrder(1, orderItems);
      await this.graphqlClient.createOrder(1, orderItems);
      await this.grpcClient.createOrder(1, orderItems);
      
      console.log('✅ All APIs successfully created orders');
      
      console.log('5. Retrieving user orders...');
      await this.restClient.getUserOrders(1);
      await this.graphqlClient.getUserOrders(1);
      await this.grpcClient.getUserOrders(1);
      
      console.log('✅ All APIs successfully retrieved user orders\n');
      
    } catch (error) {
      console.error('❌ Functionality test failed:', error.message);
    }
  }

  async runExperiment() {
    console.log('🚀 Starting API experiment...\n');
    
    await this.testFunctionality();
    
    const performanceTester = new PerformanceTester();
    await performanceTester.runAllTests();
    
    console.log('=== EXPERIMENT COMPLETE ===');
  }
}

if (require.main === module) {
  const comparison = new APIComparison();
  
  setTimeout(() => {
    comparison.runExperiment().catch(console.error);
  }, 3000);
}

module.exports = APIComparison;