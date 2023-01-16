const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
const async = require('async');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const PROTO_PRODUCT = path.resolve(__dirname, '..', 'proto', 'product.proto');
const packageProduct = protoLoader.loadSync(PROTO_PRODUCT, protoLoaderConf);
const productProto = grpc.loadPackageDefinition(packageProduct).product;

let target = 'localhost:' + process.env.PORT;
const client = new productProto.Product(target, grpc.credentials.createInsecure());

function callListProducts(callback) {
  const call = client.listProducts(function (err) {
    console.error('cara ini hanya berlaku jika client yang melakukan stream ke server');
    if (err) {
      callback(err);
      return;
    }
  });
  call.on('data', function(streamData) {
    console.log(JSON.stringify(streamData));
  });
  call.on('end', function() {
    console.log('end');
    callback();
  });
}

function main() {
  async.series([
    callListProducts
  ]);
}

main();
