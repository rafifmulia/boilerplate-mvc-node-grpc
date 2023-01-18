const helloworldRoute = require('./helloworldRoute');
const routeguideRoute = require('./routeguideRoute');
const productRoute = require('./productRoute');
const userRoute = require('./userRoute');

function routes(server) {
  helloworldRoute(server); // tutorial
  routeguideRoute(server); // tutorial
  productRoute(server); // lab
  userRoute(server); // mulai bener
  return server;
}

module.exports = routes;
