#!/bin/bash

# Network Performance Testing Script
set -e

echo "🚀 Starting Docker-based Network Performance Tests"
echo "=================================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to build and start services
start_services() {
    echo "🔨 Building and starting services..."
    docker-compose up -d --build
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check if services are healthy
    if docker-compose ps | grep -q "unhealthy\|Exit"; then
        echo "❌ Some services failed to start. Checking logs..."
        docker-compose logs
        exit 1
    fi
    
    echo "✅ All services are running"
}

# Function to run network tests
run_tests() {
    echo "🧪 Running network performance tests..."
    
    # Execute the network performance test inside the test-client container
    docker-compose exec -T test-client node benchmarks/network-performance-test.js
    
    # Copy results to host
    echo "📄 Copying results to host..."
    docker cp $(docker-compose ps -q test-client):/app/results ./results/
}

# Function to run individual condition test
run_condition_test() {
    local condition=$1
    if [ -z "$condition" ]; then
        echo "❌ Please specify a network condition"
        echo "Available conditions: FIBER, WIFI_EXCELLENT, WIFI_GOOD, LTE_4G, WIFI_POOR, MOBILE_3G, MOBILE_2G, SATELLITE, UNRELIABLE"
        exit 1
    fi
    
    echo "🌐 Testing with $condition network conditions..."
    
    # Setup network conditions
    docker-compose exec -T test-client node network-config/setup-network-conditions.js apply $condition
    
    # Wait for conditions to take effect
    sleep 5
    
    # Run a quick test
    echo "📊 Running quick performance test..."
    docker-compose exec -T test-client node benchmarks/comparison.js
    
    # Reset conditions
    docker-compose exec -T test-client node network-config/setup-network-conditions.js reset
}

# Function to show available network conditions
list_conditions() {
    echo "📋 Available network conditions:"
    docker-compose exec -T test-client node network-config/setup-network-conditions.js list
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up..."
    docker-compose down -v
    echo "✅ Cleanup completed"
}

# Function to view logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        docker-compose logs -f $service
    else
        docker-compose logs -f
    fi
}

# Main script logic
case "${1:-test}" in
    "test")
        check_docker
        start_services
        run_tests
        echo "✅ Network performance testing completed!"
        echo "📄 Check the results/ directory for detailed reports"
        ;;
    "start")
        check_docker
        start_services
        echo "✅ Services started. Use 'docker-compose logs -f' to view logs"
        ;;
    "condition")
        run_condition_test $2
        ;;
    "list")
        list_conditions
        ;;
    "logs")
        show_logs $2
        ;;
    "stop")
        cleanup
        ;;
    "help"|*)
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  test                    Run complete network performance test suite"
        echo "  start                   Start all services"
        echo "  condition <CONDITION>   Test with specific network condition"
        echo "  list                    List available network conditions"
        echo "  logs [service]          View logs (optional: specific service)"
        echo "  stop                    Stop services and cleanup"
        echo "  help                    Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 test                 # Run full test suite"
        echo "  $0 condition MOBILE_3G  # Test with 3G conditions"
        echo "  $0 logs rest-api        # View REST API logs"
        ;;
esac