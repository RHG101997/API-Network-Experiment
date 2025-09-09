# Network Performance Testing with Docker

This project now includes comprehensive network simulation capabilities using Docker Compose and Toxiproxy to test API performance under various network conditions.

## Overview

The network testing setup simulates real-world network conditions including:
- **Latency variations** (5ms to 1000ms+)
- **Bandwidth limitations** (100Kbps to 1Gbps)
- **Packet loss** (0.01% to 10%)
- **Network jitter** and instability

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for containers

### Run Complete Test Suite
```bash
# Windows
scripts\run-network-tests.bat test

# Linux/Mac  
chmod +x scripts/run-network-tests.sh
./scripts/run-network-tests.sh test

# Using npm
npm run docker:test
```

### Test Specific Network Condition
```bash
# Test with 3G mobile conditions
scripts\run-network-tests.bat condition MOBILE_3G

# Test with poor WiFi
./scripts/run-network-tests.sh condition WIFI_POOR
```

## Available Network Conditions

| Condition | Latency | Bandwidth | Packet Loss | Use Case |
|-----------|---------|-----------|-------------|----------|
| `FIBER` | 5ms | 1Gbps | 0.01% | Fiber/5G networks |
| `WIFI_EXCELLENT` | 10ms | 100Mbps | 0.1% | High-quality WiFi |
| `WIFI_GOOD` | 30ms | 50Mbps | 0.5% | Typical home WiFi |
| `LTE_4G` | 50ms | 20Mbps | 1% | 4G mobile networks |
| `WIFI_POOR` | 100ms | 10Mbps | 2% | Congested/distant WiFi |
| `MOBILE_3G` | 200ms | 2Mbps | 3% | 3G mobile networks |
| `MOBILE_2G` | 500ms | 100Kbps | 5% | 2G/EDGE networks |
| `SATELLITE` | 600ms | 5Mbps | 2% | Satellite internet |
| `UNRELIABLE` | 1000ms | 500Kbps | 10% | Extremely poor networks |

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Test Client   │────│ Toxiproxy    │────│   API Services  │
│                 │    │ (Network     │    │                 │
│ - REST Client   │    │  Simulation) │    │ - REST API      │
│ - GraphQL Client│    │              │    │ - GraphQL API   │
│ - gRPC Client   │    │ Port 8001    │    │ - gRPC API      │
│                 │    │ Port 8002    │    │                 │
│                 │    │ Port 8051    │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

### Components

1. **API Services**: Your REST, GraphQL, and gRPC servers running in containers
2. **Toxiproxy**: Network proxy that simulates various network conditions
3. **Test Client**: Runs performance tests against the proxied APIs
4. **Network Config**: JavaScript modules defining network conditions

## Usage Examples

### Manual Network Condition Control

```bash
# Start services
npm run docker:start

# Apply 3G conditions to all APIs
docker-compose exec test-client node network-config/setup-network-conditions.js apply MOBILE_3G

# Run your own tests
docker-compose exec test-client node benchmarks/comparison.js

# Reset network conditions
docker-compose exec test-client node network-config/setup-network-conditions.js reset

# Stop services
npm run docker:stop
```

### Custom Test Scripts

You can create custom test scenarios by using the NetworkSimulator class:

```javascript
const NetworkSimulator = require('./network-config/setup-network-conditions');
const simulator = new NetworkSimulator();

// Apply custom conditions
await simulator.applyConditionToAll('MOBILE_3G');

// Run your tests here
// ...

// Reset when done
await simulator.resetAllConditions();
```

## Test Results

Results are automatically saved to the `results/` directory:

- `network-performance-report.json`: Complete test data in JSON format
- Console output includes summary tables and best-performing API analysis

### Sample Output

```
📊 NETWORK PERFORMANCE TEST RESULTS
=====================================

┌─────────┬─────────────────┬───────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ (index) │    condition    │  latency  │  bandwidth  │ packetLoss  │  rest_time  │ graphql_time│
├─────────┼─────────────────┼───────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│    0    │   'Fiber/5G'    │   '5ms'   │  '1000Mbps' │   '0.01%'   │    '45ms'   │    '52ms'   │
│    1    │ 'WiFi (Good)'   │  '30ms'   │   '50Mbps'  │   '0.5%'    │    '78ms'   │    '95ms'   │
│    2    │  '3G Mobile'    │  '200ms'  │   '2Mbps'   │    '3%'     │   '456ms'   │   '523ms'   │
└─────────┴─────────────────┴───────────┴─────────────┴─────────────┴─────────────┴─────────────┘

```

## Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker status
docker info

# View service logs
docker-compose logs

# Rebuild containers
docker-compose up -d --build --force-recreate
```

**Network conditions not applying:**
```bash
# Check Toxiproxy status
docker-compose exec test-client curl http://network-proxy:8474/proxies

# Reset and reapply
docker-compose exec test-client node network-config/setup-network-conditions.js reset
docker-compose exec test-client node network-config/setup-network-conditions.js apply CONDITION_NAME
```

**Port conflicts:**
```bash
# Check what's using ports
netstat -an | grep :3001
netstat -an | grep :3002  
netstat -an | grep :50051

# Stop conflicting services or change ports in docker-compose.yml
```

## Advanced Configuration

### Custom Network Conditions

Add new conditions to `network-config/network-conditions.js`:

```javascript
CUSTOM_SLOW: {
  name: 'Custom Slow Network',
  latency: 300,     // 300ms
  jitter: 100,      // ±100ms
  bandwidth: 1,     // 1Mbps
  packetLoss: 5     // 5%
}
```

### Extending Tests

Modify `benchmarks/network-performance-test.js` to add custom test scenarios:

```javascript
async testCustomScenario(client) {
  // Your custom test logic here
  const result = await client.complexOperation();
  return result;
}
```

## Performance Insights

### Expected Results by Network Type

- **Fiber/5G**: All APIs perform similarly, differences in payload efficiency matter most
- **Good WiFi/4G**: Latency becomes noticeable, gRPC's binary protocol shows advantages  
- **3G/Poor Networks**: Payload size and connection overhead become critical factors
- **2G/Satellite**: Only lightweight operations succeed, many requests will timeout

### API Comparison Guidelines

- **REST**: Best for simple operations, suffers with multiple round trips
- **GraphQL**: Efficient data fetching but larger query overhead
- **gRPC**: Most efficient on poor networks due to binary protocol and HTTP/2

## Scripts Reference

### Windows (`scripts\run-network-tests.bat`)
- `test`: Run complete test suite
- `start`: Start services only  
- `condition <NAME>`: Test specific condition
- `list`: Show available conditions
- `logs [service]`: View logs
- `stop`: Stop and cleanup

### Linux/Mac (`scripts/run-network-tests.sh`)
Same commands as Windows version.

### npm Scripts
- `npm run docker:test`: Complete test suite
- `npm run docker:start`: Start services
- `npm run docker:stop`: Stop services
- `npm run network-test`: Run network tests (requires services running)