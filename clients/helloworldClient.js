const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const PROTO_HELLO_WORLD = path.resolve(__dirname, '../proto/', 'helloworld.proto');
const packageHelloWorld = protoLoader.loadSync(PROTO_HELLO_WORLD, protoLoaderConf);

const helloWorldProto = grpc.loadPackageDefinition(packageHelloWorld).helloworld;
let target = 'localhost:' + process.env.PORT;
const client = new helloWorldProto.Greeter(target, grpc.credentials.createInsecure());

function main() {
  client.sayHi({name: 'rafifmulia'}, function(err, resp) {
    if (err) return;
    console.log(resp.message);
  });
}

main();
