const RestClient = require('../clients/rest-client');
const GraphQLClient = require('../clients/graphql-client');
const GRPCClient = require('../clients/grpc-client');

class PerformanceTester {
  constructor() {
    this.restClient = new RestClient(process.env.REST_URL || 'http://localhost:3001');
    this.graphqlClient = new GraphQLClient(process.env.GRAPHQL_URL || 'http://localhost:3002/graphql');
    this.grpcClient = new GRPCClient(process.env.GRPC_URL || 'localhost:50051');
    this.results = {};
  }

  async measureTime(operation) {
    const start = process.hrtime.bigint();
    const result = await operation();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    return { result, duration };
  }

  async measurePayloadSize(data) {
    return JSON.stringify(data).length;
  }

  async testCreateUser(iterations = 10) {
    const results = { rest: [], graphql: [], grpc: [] };
    
    for (let i = 0; i < iterations; i++) {
      const userName = `testuser${Date.now()}${i}`;
      const userEmail = `test${Date.now()}${i}@example.com`;
      
      // REST
      try {
        const { result: restResult, duration: restTime } = await this.measureTime(
          () => this.restClient.createUser(userName, userEmail)
        );
        const restSize = await this.measurePayloadSize(restResult);
        results.rest.push({ time: restTime, size: restSize, success: true });
      } catch (error) {
        results.rest.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // GraphQL
      try {
        const { result: gqlResult, duration: gqlTime } = await this.measureTime(
          () => this.graphqlClient.createUser(userName + '_gql', userEmail.replace('@', '_gql@'))
        );
        const gqlSize = await this.measurePayloadSize(gqlResult);
        results.graphql.push({ time: gqlTime, size: gqlSize, success: true });
      } catch (error) {
        results.graphql.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // gRPC
      try {
        const { result: grpcResult, duration: grpcTime } = await this.measureTime(
          () => this.grpcClient.createUser(userName + '_grpc', userEmail.replace('@', '_grpc@'))
        );
        const grpcSize = await this.measurePayloadSize(grpcResult);
        results.grpc.push({ time: grpcTime, size: grpcSize, success: true });
      } catch (error) {
        results.grpc.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  async testGetUser(iterations = 50) {
    const results = { rest: [], graphql: [], grpc: [] };
    const userId = 1; // Use existing user

    for (let i = 0; i < iterations; i++) {
      // REST
      try {
        const { result: restResult, duration: restTime } = await this.measureTime(
          () => this.restClient.getUser(userId)
        );
        const restSize = await this.measurePayloadSize(restResult);
        results.rest.push({ time: restTime, size: restSize, success: true });
      } catch (error) {
        results.rest.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // GraphQL
      try {
        const { result: gqlResult, duration: gqlTime } = await this.measureTime(
          () => this.graphqlClient.getUser(userId)
        );
        const gqlSize = await this.measurePayloadSize(gqlResult);
        results.graphql.push({ time: gqlTime, size: gqlSize, success: true });
      } catch (error) {
        results.graphql.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // gRPC
      try {
        const { result: grpcResult, duration: grpcTime } = await this.measureTime(
          () => this.grpcClient.getUser(userId)
        );
        const grpcSize = await this.measurePayloadSize(grpcResult);
        results.grpc.push({ time: grpcTime, size: grpcSize, success: true });
      } catch (error) {
        results.grpc.push({ time: 0, size: 0, success: false, error: error.message });
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
  }

  async testGetProducts(iterations = 30) {
    const results = { rest: [], graphql: [], grpc: [] };

    for (let i = 0; i < iterations; i++) {
      // REST
      try {
        const { result: restResult, duration: restTime } = await this.measureTime(
          () => this.restClient.getProducts('Electronics', 5, 0)
        );
        const restSize = await this.measurePayloadSize(restResult);
        results.rest.push({ time: restTime, size: restSize, success: true });
      } catch (error) {
        results.rest.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // GraphQL
      try {
        const { result: gqlResult, duration: gqlTime } = await this.measureTime(
          () => this.graphqlClient.getProducts('Electronics', 5, 0)
        );
        const gqlSize = await this.measurePayloadSize(gqlResult);
        results.graphql.push({ time: gqlTime, size: gqlSize, success: true });
      } catch (error) {
        results.graphql.push({ time: 0, size: 0, success: false, error: error.message });
      }

      // gRPC
      try {
        const { result: grpcResult, duration: grpcTime } = await this.measureTime(
          () => this.grpcClient.getProducts('Electronics', 5, 0)
        );
        const grpcSize = await this.measurePayloadSize(grpcResult);
        results.grpc.push({ time: grpcTime, size: grpcSize, success: true });
      } catch (error) {
        results.grpc.push({ time: 0, size: 0, success: false, error: error.message });
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
  }

  calculateStats(data) {
    const successfulRequests = data.filter(r => r.success);
    if (successfulRequests.length === 0) {
      return { avgTime: 0, minTime: 0, maxTime: 0, avgSize: 0, successRate: 0 };
    }

    const times = successfulRequests.map(r => r.time);
    const sizes = successfulRequests.map(r => r.size);

    return {
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
      successRate: (successfulRequests.length / data.length) * 100
    };
  }

  async runAllTests() {
    console.log('Starting performance tests...\n');

    console.log('Testing Create User operations...');
    const createUserResults = await this.testCreateUser(10);
    
    console.log('Testing Get User operations...');
    const getUserResults = await this.testGetUser(50);
    
    console.log('Testing Get Products operations...');
    const getProductsResults = await this.testGetProducts(30);

    // Calculate statistics
    const stats = {
      createUser: {
        rest: this.calculateStats(createUserResults.rest),
        graphql: this.calculateStats(createUserResults.graphql),
        grpc: this.calculateStats(createUserResults.grpc)
      },
      getUser: {
        rest: this.calculateStats(getUserResults.rest),
        graphql: this.calculateStats(getUserResults.graphql),
        grpc: this.calculateStats(getUserResults.grpc)
      },
      getProducts: {
        rest: this.calculateStats(getProductsResults.rest),
        graphql: this.calculateStats(getProductsResults.graphql),
        grpc: this.calculateStats(getProductsResults.grpc)
      }
    };

    this.printResults(stats);
    return stats;
  }

  printResults(stats) {
    console.log('\n=== PERFORMANCE TEST RESULTS ===\n');
    
    Object.keys(stats).forEach(operation => {
      console.log(`${operation.toUpperCase()} Operation:`);
      console.log('┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
      console.log('│   API Type  │  Avg Time   │  Min Time   │  Max Time   │  Payload    │ Success Rate│');
      console.log('│             │    (ms)     │    (ms)     │    (ms)     │   (bytes)   │     (%)     │');
      console.log('├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
      
      ['rest', 'graphql', 'grpc'].forEach(api => {
        const stat = stats[operation][api];
        console.log(`│ ${api.padEnd(11)} │ ${stat.avgTime.toFixed(2).padStart(11)} │ ${stat.minTime.toFixed(2).padStart(11)} │ ${stat.maxTime.toFixed(2).padStart(11)} │ ${stat.avgSize.toFixed(0).padStart(11)} │ ${stat.successRate.toFixed(1).padStart(11)} │`);
      });
      
      console.log('└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘\n');
    });
  }
}

if (require.main === module) {
  const tester = new PerformanceTester();
  
  // Wait a bit for servers to be ready
  setTimeout(() => {
    tester.runAllTests().catch(console.error);
  }, 2000);
}

module.exports = PerformanceTester;