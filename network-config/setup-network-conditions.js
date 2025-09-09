#!/usr/bin/env node

const axios = require('axios');
const NetworkConditions = require('./network-conditions');

const TOXIPROXY_HOST = 'http://network-proxy:8474';

class NetworkSimulator {
  constructor() {
    this.toxiproxy = axios.create({
      baseURL: TOXIPROXY_HOST,
      timeout: 5000
    });
  }

  async setupProxy(proxyName, listenPort, upstreamHost, upstreamPort) {
    try {
      // Create proxy
      await this.toxiproxy.post('/proxies', {
        name: proxyName,
        listen: `0.0.0.0:${listenPort}`,
        upstream: `${upstreamHost}:${upstreamPort}`,
        enabled: true
      });
      console.log(`✅ Created proxy: ${proxyName}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`⚠️  Proxy ${proxyName} already exists`);
      } else {
        console.error(`❌ Failed to create proxy ${proxyName}:`, error.message);
        throw error;
      }
    }
  }

  async applyNetworkCondition(proxyName, condition) {
    try {
      // Clear existing toxics
      await this.clearToxics(proxyName);

      const { latency, jitter, bandwidth, packetLoss } = condition;

      // Apply latency toxic
      if (latency > 0) {
        await this.toxiproxy.post(`/proxies/${proxyName}/toxics`, {
          name: `${proxyName}_latency`,
          type: 'latency',
          attributes: {
            latency: latency,
            jitter: jitter || 0
          }
        });
      }

      // Apply bandwidth toxic (convert Mbps to bytes/sec)
      if (bandwidth && bandwidth < 1000) {
        const bytesPerSecond = bandwidth * 125000; // Mbps to bytes/sec
        await this.toxiproxy.post(`/proxies/${proxyName}/toxics`, {
          name: `${proxyName}_bandwidth`,
          type: 'bandwidth',
          attributes: {
            rate: bytesPerSecond
          }
        });
      }

      // Apply packet loss toxic
      if (packetLoss > 0) {
        await this.toxiproxy.post(`/proxies/${proxyName}/toxics`, {
          name: `${proxyName}_slicer`,
          type: 'slicer',
          attributes: {
            average_size: 1024,
            size_variation: 512,
            delay: latency / 10 // Small delay between slices
          }
        });
      }

      console.log(`✅ Applied ${condition.name} conditions to ${proxyName}`);
    } catch (error) {
      console.error(`❌ Failed to apply conditions to ${proxyName}:`, error.message);
      throw error;
    }
  }

  async clearToxics(proxyName) {
    try {
      const response = await this.toxiproxy.get(`/proxies/${proxyName}/toxics`);
      const toxics = response.data;
      
      for (const toxic of toxics) {
        await this.toxiproxy.delete(`/proxies/${proxyName}/toxics/${toxic.name}`);
      }
    } catch (error) {
      // Ignore errors when clearing toxics
    }
  }

  async setupAllProxies() {
    console.log('🚀 Setting up network proxies...');
    
    await this.setupProxy('rest_proxy', 8001, 'rest-api', 3001);
    await this.setupProxy('graphql_proxy', 8002, 'graphql-api', 3002);  
    await this.setupProxy('grpc_proxy', 8051, 'grpc-api', 50051);
  }

  async applyConditionToAll(conditionName) {
    const condition = NetworkConditions[conditionName];
    if (!condition) {
      throw new Error(`Unknown network condition: ${conditionName}`);
    }

    console.log(`🌐 Applying ${condition.name} network conditions...`);
    console.log(`   Latency: ${condition.latency}ms (±${condition.jitter || 0}ms)`);
    console.log(`   Bandwidth: ${condition.bandwidth}Mbps`);
    console.log(`   Packet Loss: ${condition.packetLoss}%`);

    await this.applyNetworkCondition('rest_proxy', condition);
    await this.applyNetworkCondition('graphql_proxy', condition);
    await this.applyNetworkCondition('grpc_proxy', condition);
  }

  async resetAllConditions() {
    console.log('🔄 Resetting all network conditions...');
    await this.clearToxics('rest_proxy');
    await this.clearToxics('graphql_proxy');
    await this.clearToxics('grpc_proxy');
    console.log('✅ All conditions reset');
  }

  async listConditions() {
    console.log('\n📋 Available network conditions:');
    Object.entries(NetworkConditions).forEach(([key, condition]) => {
      console.log(`\n${key}: ${condition.name}`);
      console.log(`  - Latency: ${condition.latency}ms (±${condition.jitter || 0}ms)`);
      console.log(`  - Bandwidth: ${condition.bandwidth}Mbps`);
      console.log(`  - Packet Loss: ${condition.packetLoss}%`);
    });
  }
}

// CLI interface
async function main() {
  const simulator = new NetworkSimulator();
  const command = process.argv[2];
  const condition = process.argv[3];

  try {
    switch (command) {
      case 'setup':
        await simulator.setupAllProxies();
        break;
      case 'apply':
        if (!condition) {
          console.error('❌ Please specify a network condition');
          process.exit(1);
        }
        await simulator.applyConditionToAll(condition);
        break;
      case 'reset':
        await simulator.resetAllConditions();
        break;
      case 'list':
        await simulator.listConditions();
        break;
      default:
        console.log('Usage:');
        console.log('  node setup-network-conditions.js setup');
        console.log('  node setup-network-conditions.js apply <CONDITION>');
        console.log('  node setup-network-conditions.js reset');
        console.log('  node setup-network-conditions.js list');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = NetworkSimulator;