const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
const productController = require('../controllers/productController');

const PROTO_PRODUCT = path.resolve(__dirname, '..', 'proto', 'product.proto');
const packageProduct = protoLoader.loadSync(PROTO_PRODUCT, protoLoaderConf);
const productProto = grpc.loadPackageDefinition(packageProduct).product;

function route(server) {
  server.addService(productProto.Product.service, {
    listProducts: productController.listProducts,
    listProducts1: productController.listProducts1,
    listProducts2: productController.listProducts2,
    detailProduct: productController.detailProduct,
    searchProduct: productController.searchProduct,
  })
}

module.exports = route;
