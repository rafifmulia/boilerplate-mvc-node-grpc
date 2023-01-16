const grpc = require('@grpc/grpc-js');
require('dotenv').config({ override: true });

const server = new grpc.Server();
const routes = require('./routes/index');
const routeServer = routes(server);
routeServer.bindAsync('0.0.0.0:' + process.env.PORT, grpc.ServerCredentials.createInsecure(), () => {
  console.log('server start on => 0.0.0.0:' + process.env.PORT);
  routeServer.start();
})
