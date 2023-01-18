const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
const async = require('async');
const fs = require('fs');
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

function callDeadlineProduct() {
  try {
    client.deadlineProduct({}, {deadline: Date.now()+5000}, function(err, response) {
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

function callDownloadProduct() {
  try {
    const call = client.downloadProduct({});
    fs.writeFileSync('product_db.json', '');
    const fd = fs.openSync('product_db.json', 'as'); // langsung w tanpa writeFileSync juga bisa
    call.on('data', function({fileChunk}) {
      fs.writeSync(fd, fileChunk);
    });
    call.on('end', function() {
      fs.closeSync(fd);
      console.log('end');
    });
  } catch(err) {
    console.error(err);
  }
}

function main() {
  Promise.all([
    // callListProducts(),
    // callDetailProduct(),
    // callSearchProduct(),
    // callDeadlineProduct(),
    callDownloadProduct()
  ]);
}

main();
