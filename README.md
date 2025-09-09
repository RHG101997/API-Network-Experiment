# API Experiments: REST vs GraphQL vs gRPC

A practical comparison of three popular API architectures through hands-on experimentation.

## Overview

This project implements the same e-commerce API using three different approaches:
- **REST API** (Express.js)
- **GraphQL API** (Apollo Server)
- **gRPC API** (Protocol Buffers)

All APIs share the same SQLite database and implement identical operations for direct comparison.

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Simple one-command test
run-docker-test.cmd

# Or using PowerShell
.\run-tests.ps1 test

# Or manually with docker-compose
docker-compose -f docker-compose.simple.yml up -d --build
docker-compose -f docker-compose.simple.yml exec -T test-client node benchmarks/comparison.js
docker-compose -f docker-compose.simple.yml down
```

### Option 2: Local Development
```bash
# Install dependencies
npm install

# Set up the database
npm run setup-db

# Start all servers (in separate terminals)
npm run start-rest      # http://localhost:3001
npm run start-graphql   # http://localhost:3002/graphql
npm run start-grpc      # 0.0.0.0:50051

# Run experiments (wait ~5 seconds after starting servers)
npm run test-all

# Or run individual performance tests
npm run benchmark
```

## API Operations

Each API implements these core operations:
- Create user
- Get user by ID
- List products (with filtering/pagination)
- Create order
- Get user's order history

## Development Experience Comparison

### Setup Complexity
- **REST**: ⭐⭐⭐ Simple Express setup
- **GraphQL**: ⭐⭐ Schema + resolvers needed
- **gRPC**: ⭐ Proto files + code generation

### Learning Curve
- **REST**: ⭐⭐⭐ Most familiar to developers
- **GraphQL**: ⭐⭐ Query language to learn
- **gRPC**: ⭐ Protocol buffers + concepts

### Type Safety
- **REST**: ⭐ Manual validation needed
- **GraphQL**: ⭐⭐ Schema provides some safety
- **gRPC**: ⭐⭐⭐ Strong typing with proto files

### Documentation
- **REST**: ⭐ Manual API documentation
- **GraphQL**: ⭐⭐⭐ Self-documenting schema
- **gRPC**: ⭐⭐ Proto files as documentation

### Tooling
- **REST**: ⭐⭐⭐ Excellent ecosystem
- **GraphQL**: ⭐⭐⭐ GraphQL Playground, Apollo
- **gRPC**: ⭐⭐ Growing but limited tools

### Flexibility
- **REST**: ⭐⭐ Multiple endpoints needed
- **GraphQL**: ⭐⭐⭐ Query exactly what you need
- **gRPC**: ⭐⭐ Structured service definitions

## Use Case Recommendations

### 🏆 REST API - Best for:
- Simple CRUD applications
- Public APIs with wide compatibility
- Teams new to API development
- Caching-heavy applications

### 🏆 GraphQL - Best for:
- Frontend-driven development
- Complex data relationships
- Mobile apps (bandwidth efficiency)
- Real-time applications

### 🏆 gRPC - Best for:
- Microservices communication
- High-performance requirements
- Streaming data applications
- Polyglot environments

## Pros & Cons Summary

### REST API
**Pros**: Simple, widely supported, HTTP caching, stateless
**Cons**: Over/under-fetching, multiple requests, versioning issues

### GraphQL
**Pros**: Single endpoint, precise data fetching, strong typing, real-time
**Cons**: Complex caching, learning curve, can be overkill for simple APIs

### gRPC
**Pros**: High performance, strong typing, streaming, language agnostic
**Cons**: Browser limitations, steeper learning curve, limited HTTP integration

## Project Structure

```
├── database/           # SQLite schema and setup
├── rest-api/          # Express.js REST server
├── graphql-api/       # Apollo GraphQL server
├── grpc-api/          # gRPC server with proto files
├── clients/           # Client implementations for each API
└── benchmarks/        # Performance testing tools
```

## Running Experiments

The benchmark suite tests:
- Response times under different loads
- Payload sizes
- Success rates
- Functionality verification

Results show practical differences in performance and developer experience across all three approaches.