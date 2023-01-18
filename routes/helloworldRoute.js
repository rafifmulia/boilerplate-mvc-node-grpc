const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
const helloWorldController = require('../controllers/helloworldController');

const PROTO_HELLO_WORLD = path.resolve(__dirname, '..', 'proto', 'helloworld.proto');

const packageHelloWorld = protoLoader.loadSync(PROTO_HELLO_WORLD, protoLoaderConf);

const protoHelloWorld = grpc.loadPackageDefinition(packageHelloWorld).helloworld;

function route(server) {
  server.addService(protoHelloWorld.Greeter.service, {sayHi: helloWorldController.sayHi});
}

module.exports = route;
