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

async function callListProducts() {
  try {
    const call = await client.listProducts();
    call.on('data', function(streamData) {
      console.log(streamData);
      // console.log(JSON.stringify(streamData));
      // console.log(streamData.data[0].seller);
    });
    call.on('error', function(err) {
      console.log('error from server');
      console.log(JSON.stringify(err));
    });
    call.on('end', function() {
      console.log('end');
    });
  } catch (err) {
    console.error(err);
  }
}

function callDetailProduct() {
  try {
    client.detailProduct({id: 1, year: 2022}, function(err, response) {
      if (err) {
        console.log('ini error');
        console.log(JSON.stringify(err));
        return;
      }
      console.log(response);
    });
  } catch(err) {
    console.error(err);
  }
}

function callSearchProduct() {
  try {
    client.searchProduct({id: 1, year: 2022}, function(err, response) {
      if (err) {
        console.log('ini error');
        console.log(JSON.stringify(err));
        return;
      }
      console.log(response);
    });
  } catch(err) {
    console.error(err);
  }
}

function main() {
  Promise.all([
    // callListProducts(),
    // callDetailProduct(),
    callSearchProduct()
  ]);
}

main();
