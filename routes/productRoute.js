const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
const productController = require('../controllers/productController');

const PROTO_PRODUCT = path.resolve(__dirname, '..', 'proto', 'product.proto');
const packageProduct = protoLoader.loadSync(PROTO_PRODUCT, protoLoaderConf);
const protoProduct = grpc.loadPackageDefinition(packageProduct).product;

// cara lain load & penggunaan proto
// https://stackoverflow.com/questions/33792728/cant-read-bytes-from-protobuf-message-in-javascript

function route(server) {
  server.addService(protoProduct.Product.service, {
    listProducts: productController.listProducts,
    listProducts1: productController.listProducts1,
    listProducts2: productController.listProducts2,
    detailProduct: productController.detailProduct,
    searchProduct: productController.searchProduct,
    deadlineProduct: productController.deadlineProduct,
    downloadProduct: productController.downloadProduct,
  })
}

module.exports = route;
