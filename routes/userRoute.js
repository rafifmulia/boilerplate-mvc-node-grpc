const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConfig = require('../configs/protoLoaderConf');
const userController = require('../controllers/userController');

const PROTO_USER = path.resolve(__dirname, '..', 'proto', 'user.proto');
const packageUser = protoLoader.loadSync(PROTO_USER, protoLoaderConfig);
const protoUser = grpc.loadPackageDefinition(packageUser).user;

function route(server) {
  server.addService(protoUser.User.service, {
    detailUser: userController.detailUser,
    listUser: userController.listUser,
    addUser: userController.addUser,
    updateUser: userController.updateUser,
    downloadUser: userController.downloadUser,
  });
}

module.exports = route;
