const helloworldRoute = require('./helloworldRoute');
const routeguideRoute = require('./routeguideRoute');
const productRoute = require('./productRoute');

function routes(server) {
  helloworldRoute(server);
  routeguideRoute(server);
  productRoute(server);
  return server;
}

module.exports = routes;
