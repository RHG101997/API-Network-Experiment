const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const http = require('http');
const cors = require('cors');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers');

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = 3002;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use('/graphql', cors(), express.json(), expressMiddleware(server));

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`GraphQL API server running on http://localhost:${PORT}/graphql`);
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});