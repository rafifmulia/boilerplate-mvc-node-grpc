const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const protoLoaderConf = require('../configs/protoLoaderConf');
const routeguideController = require('../controllers/routeguideController');

const PROTO_ROUTE_GUIDE = path.resolve(__dirname, '..', 'proto', 'routeguide.proto');

const packageRouteGuide = protoLoader.loadSync(PROTO_ROUTE_GUIDE, protoLoaderConf);

const routeGuideProto = grpc.loadPackageDefinition(packageRouteGuide).routeguide;

function route(server) {
  server.addService(routeGuideProto.RouteGuide.service, {
    getFeature: routeguideController.getFeature,
    listFeatures: routeguideController.listFeatures,
    recordRoute: routeguideController.recordRoute,
    routeChat: routeguideController.routeChat
  })
}

module.exports = route;
