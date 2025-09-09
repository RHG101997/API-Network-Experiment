#!/usr/bin/env node

const NetworkConditions = require('../network-config/network-conditions');
const NetworkSimulator = require('../network-config/setup-network-conditions');
const fs = require('fs').promises;
const path = require('path');

// Import existing clients
const RestClient = require('../clients/rest-client');
const GraphQLClient = require('../clients/graphql-client');
const GrpcClient = require('../clients/grpc-client');

class NetworkPerformanceTest {
  constructor() {
    this.simulator = new NetworkSimulator();
    this.results = [];
    
    // Configure clients to use network proxies
    this.clients = {
      rest: new RestClient('http://network-proxy:8001'),
      graphql: new GraphQLClient('http://network-proxy:8002/graphql'),
      grpc: new GrpcClient('network-proxy:8051')
    };
  }

  async waitForServices() {
    console.log('⏳ Waiting for services to be ready...');
    let retries = 30;
    
    while (retries > 0) {
      try {
        // Test if services are responding
        const testUser = { name: 'Test User', email: 'test@test.com' };
        await this.clients.rest.createUser(testUser);
        console.log('✅ Services are ready');
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('Services failed to start within timeout');
        }
        await this.sleep(2000);
      }
    }
  }

  async runTestSuite(condition, conditionName) {
    console.log(`\n🧪 Testing under ${condition.name} conditions...`);
    
    const testResults = {
      condition: conditionName,
      conditionDetails: condition,
      timestamp: new Date().toISOString(),
      results: {}
    };

    // Test each API type
    for (const [apiType, client] of Object.entries(this.clients)) {
      console.log(`  📡 Testing ${apiType.toUpperCase()} API...`);
      
      try {
        const apiResults = await this.testAPI(client, apiType);
        testResults.results[apiType] = apiResults;
        
        console.log(`    ⚡ Avg Response Time: ${apiResults.avgResponseTime}ms`);
        console.log(`    ✅ Success Rate: ${apiResults.successRate}%`);
        console.log(`    📦 Avg Payload Size: ${apiResults.avgPayloadSize} bytes`);
      } catch (error) {
        console.log(`    ❌ Failed: ${error.message}`);
        testResults.results[apiType] = {
          error: error.message,
          avgResponseTime: null,
          successRate: 0,
          avgPayloadSize: null
        };
      }
    }

    this.results.push(testResults);
    return testResults;
  }

  async testAPI(client, apiType) {
    const operations = [];
    const payloadSizes = [];
    let successCount = 0;
    const totalOperations = 10;

    // Perform various operations to test different scenarios
    for (let i = 0; i < totalOperations; i++) {
      try {
        const startTime = Date.now();
        
        // Test user creation
        const user = await client.createUser({
          name: `Test User ${i}`,
          email: `user${i}@test.com`
        });
        
        const userTime = Date.now() - startTime;
        operations.push(userTime);
        payloadSizes.push(JSON.stringify(user).length);
        
        // Test product listing  
        const listStartTime = Date.now();
        const products = await client.getProducts({ limit: 5 });
        const listTime = Date.now() - listStartTime;
        operations.push(listTime);
        payloadSizes.push(JSON.stringify(products).length);
        
        // Test order creation
        if (products && products.length > 0) {
          const orderStartTime = Date.now();
          const order = await client.createOrder({
            userId: user.id,
            items: [{ productId: products[0].id, quantity: 1 }]
          });
          const orderTime = Date.now() - orderStartTime;
          operations.push(orderTime);
          payloadSizes.push(JSON.stringify(order).length);
        }
        
        successCount++;
      } catch (error) {
        console.log(`    ⚠️  Operation ${i + 1} failed: ${error.message}`);
        operations.push(5000); // Penalty time for failed operations
      }
    }

    return {
      avgResponseTime: Math.round(operations.reduce((a, b) => a + b, 0) / operations.length),
      successRate: Math.round((successCount / totalOperations) * 100),
      avgPayloadSize: Math.round(payloadSizes.reduce((a, b) => a + b, 0) / payloadSizes.length),
      totalOperations,
      successfulOperations: successCount
    };
  }

  async runAllConditions() {
    console.log('🚀 Starting comprehensive network performance tests...\n');
    
    // Wait for services to be ready
    await this.waitForServices();

    // Test conditions in order from best to worst
    const testOrder = [
      'FIBER',
      'WIFI_EXCELLENT', 
      'WIFI_GOOD',
      'LTE_4G',
      'WIFI_POOR',
      'MOBILE_3G',
      'MOBILE_2G',
      'SATELLITE',
      'UNRELIABLE'
    ];

    for (const conditionName of testOrder) {
      const condition = NetworkConditions[conditionName];
      
      try {
        // Apply network condition
        await this.simulator.applyConditionToAll(conditionName);
        await this.sleep(2000); // Wait for conditions to take effect
        
        // Run tests
        await this.runTestSuite(condition, conditionName);
        
        // Small delay between test suites
        await this.sleep(1000);
      } catch (error) {
        console.error(`❌ Failed to test ${conditionName}: ${error.message}`);
      }
    }

    // Reset conditions
    await this.simulator.resetAllConditions();
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '../results/network-performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate summary
    console.log('\n📊 NETWORK PERFORMANCE TEST RESULTS');
    console.log('=====================================\n');
    
    // Create comparison table
    const tableData = [];
    
    for (const result of this.results) {
      if (!result.results) continue;
      
      const row = {
        condition: result.conditionDetails.name,
        latency: `${result.conditionDetails.latency}ms`,
        bandwidth: `${result.conditionDetails.bandwidth}Mbps`,
        packetLoss: `${result.conditionDetails.packetLoss}%`
      };
      
      // Add API performance data
      ['rest', 'graphql', 'grpc'].forEach(api => {
        const apiResult = result.results[api];
        if (apiResult && !apiResult.error) {
          row[`${api}_time`] = `${apiResult.avgResponseTime}ms`;
          row[`${api}_success`] = `${apiResult.successRate}%`;
        } else {
          row[`${api}_time`] = 'FAIL';
          row[`${api}_success`] = '0%';
        }
      });
      
      tableData.push(row);
    }
    
    // Print formatted table
    if (tableData.length > 0) {
      console.table(tableData);
      
      // Find best performing API for each condition
      console.log('\n🏆 Best Performing API by Network Condition:');
      for (const result of this.results) {
        if (!result.results) continue;
        
        const apis = ['rest', 'graphql', 'grpc'];
        const validResults = apis
          .map(api => ({
            api,
            time: result.results[api]?.avgResponseTime,
            success: result.results[api]?.successRate
          }))
          .filter(r => r.time && r.success > 50);
          
        if (validResults.length > 0) {
          const best = validResults.reduce((a, b) => 
            a.time < b.time ? a : b
          );
          console.log(`  ${result.conditionDetails.name}: ${best.api.toUpperCase()} (${best.time}ms)`);
        }
      }
    }
    
    console.log(`\n📄 Full results saved to: ${reportPath}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main() {
  const tester = new NetworkPerformanceTest();
  
  try {
    await tester.runAllConditions();
    await tester.generateReport();
    console.log('\n✅ Network performance testing completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = NetworkPerformanceTest;