// Network condition presets for testing different scenarios
const NetworkConditions = {
  // High-speed networks
  FIBER: {
    name: 'Fiber/5G',
    latency: 5,      // 5ms
    jitter: 1,       // ±1ms
    bandwidth: 1000, // 1Gbps (no practical limit for our tests)
    packetLoss: 0.01 // 0.01%
  },
  
  WIFI_EXCELLENT: {
    name: 'WiFi (Excellent)',
    latency: 10,     // 10ms
    jitter: 2,       // ±2ms  
    bandwidth: 100,  // 100Mbps
    packetLoss: 0.1  // 0.1%
  },

  // Medium-speed networks
  WIFI_GOOD: {
    name: 'WiFi (Good)',
    latency: 30,     // 30ms
    jitter: 5,       // ±5ms
    bandwidth: 50,   // 50Mbps
    packetLoss: 0.5  // 0.5%
  },

  LTE_4G: {
    name: '4G LTE',
    latency: 50,     // 50ms
    jitter: 10,      // ±10ms
    bandwidth: 20,   // 20Mbps
    packetLoss: 1    // 1%
  },

  // Slower networks
  WIFI_POOR: {
    name: 'WiFi (Poor)',
    latency: 100,    // 100ms
    jitter: 20,      // ±20ms
    bandwidth: 10,   // 10Mbps
    packetLoss: 2    // 2%
  },

  MOBILE_3G: {
    name: '3G Mobile',
    latency: 200,    // 200ms
    jitter: 50,      // ±50ms
    bandwidth: 2,    // 2Mbps
    packetLoss: 3    // 3%
  },

  // Very slow/unreliable networks
  MOBILE_2G: {
    name: '2G Mobile',
    latency: 500,    // 500ms
    jitter: 100,     // ±100ms
    bandwidth: 0.1,  // 100Kbps
    packetLoss: 5    // 5%
  },

  SATELLITE: {
    name: 'Satellite',
    latency: 600,    // 600ms (geostationary)
    jitter: 200,     // ±200ms
    bandwidth: 5,    // 5Mbps
    packetLoss: 2    // 2%
  },

  // Extreme conditions for stress testing
  UNRELIABLE: {
    name: 'Unreliable Network',
    latency: 1000,   // 1000ms
    jitter: 500,     // ±500ms
    bandwidth: 0.5,  // 500Kbps
    packetLoss: 10   // 10%
  }
};

module.exports = NetworkConditions;