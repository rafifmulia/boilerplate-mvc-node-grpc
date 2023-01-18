const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const _ = require('lodash');
const protoLoaderConf = require('../configs/protoLoaderConf');
const async = require('async');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const PROTO_ROUTE_GUIDE = path.resolve(__dirname, '..', 'proto', 'routeguide.proto');
const packageRouteGuide = protoLoader.loadSync(PROTO_ROUTE_GUIDE, protoLoaderConf);

const routeGuideProto = grpc.loadPackageDefinition(packageRouteGuide).routeguide;
let target = 'localhost:' + process.env.PORT;
const client = new routeGuideProto.RouteGuide(target, grpc.credentials.createInsecure());

const COORD_FACTOR = 1e7;

function callGetFeature() {
  function respGetFeature(err, resp) {
    if (err) return;
    if (resp.name.length > 1) {
      console.log('location found => ', resp);
    } else {
      console.log('location not found => ', resp);
    }
  }
  const point0 = {
    latitude: 0,
    longitude: 0
  };
  const point1 = {
    latitude: 409146138,
    longitude: -746188906
  };
  client.getFeature(point0, respGetFeature);
  client.getFeature(point1, respGetFeature);
}

function callListFeatures(callback) {
  const rectangle = {
    lo: {
      latitude: 400000000,
      longitude: -750000000
    },
    hi: {
      latitude: 420000000,
      longitude: -730000000
    }
  };
  console.log('Looking for features between 40, -75 and 42, -73');
  const call = client.listFeatures(rectangle);
  call.on('data', function(feature) {
    console.log('Found feature called "' + feature.name + '" at ' +
          feature.location.latitude/COORD_FACTOR + ', ' +
          feature.location.longitude/COORD_FACTOR);
  });
  call.on('end', function() {
    console.log('end response of stream');
    callback();
  });
  // setTimeout(() => {
  //   try {
  //     call.cancel();
  //   } catch (err) {
  //     console.log('cancelled');
  //   }
  // }, 2000);
}

function callRecordRoute() {
  const fs = require('fs');
  fs.readFile(path.resolve(__dirname, '..', 'db', 'route_guide_db.json'), function(err, data) {
    if (err) throw err;
    let feature_list = JSON.parse(data);
    let num_points = 10;
    const call = client.recordRoute(function (err, stats) {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Finished trip with', stats.point_count, 'points');
      console.log('Passed', stats.feature_count, 'features');
      console.log('Travelled', stats.distance, 'meters');
      console.log('It took', stats.elapsed_time, 'seconds');
    });
    function pointSender(lat, lng) {
      return function(callback) {
        console.log('Visiting point ' + lat/COORD_FACTOR + ', ' + lng/COORD_FACTOR);
        call.write({
          latitude: lat,
          longitude: lng
        });
        _.delay(callback, _.random(500, 1500));
      };
    }
    const point_senders = [];
    for (let i = 0; i < num_points; i++) {
      const rand_point = feature_list[_.random(0, feature_list.length - 1)];
      point_senders[i] = pointSender(rand_point.location.latitude, rand_point.location.longitude);
    }
    async.series(point_senders, function() {
      call.end();
    });
  });
}

function callRouteChat() {
  const call = client.routeChat();
  call.on('data', function(reply) {
    console.log('reply => ', reply);
    if (reply.counter === 3) {
      console.log('end dari client');
      call.end();
      return;
    }
    call.write({
      location: {
        latitude: 0,
        longitude: 0
      },
      message: 'First message',
      counter: ++reply.counter
    });
    console.log('sending => ', reply.counter);
  });
  call.on('end', function() {
    console.log('real finish');
    return;
  });
  call.write({
    location: {
      latitude: 0,
      longitude: 0
    },
    message: 'First message',
    counter: 1
  });
  console.log('sending => 1');
}

function main() {
  // Promise.all([
  //   // callGetFeature(),
  //   // callListFeatures(),
  //   // callRecordRoute(),
  //   // callRouteChat(),
  // ])
  async.series([
    // callGetFeature,
    callListFeatures,
    // callRecordRoute,
    // callRouteChat
  ]);
}

main();
