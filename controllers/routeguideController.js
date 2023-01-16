const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let feature_list;
const COORD_FACTOR = 1e7;

function checkFeature(latitude, longitude) {
  for (const feature of feature_list) {
    if (feature.location.latitude === latitude && feature.location.longitude === longitude) {
      return feature;
    }
  }
  return {
    name: '',
    location: {
      latitude,
      longitude,
    },
  };
}

async function getFeature(call, callback) {
  try {
    const { latitude, longitude } = call.request;
    const feature = checkFeature(latitude, longitude);
    callback(null, feature);
  } catch (err) {
    console.error(err);
  }
}

/**
 * listFeatures request handler. Gets a request with two points, and responds
 * with a stream of all features in the bounding box defined by those points.
 * @param {Writable} call Writable stream for responses with an additional
 *     request property for the request value.
 */
async function listFeatures(call) {
  try {
    const { lo, hi } = call.request;
    const left = _.min([lo.longitude, hi.longitude]);
    const right = _.max([lo.longitude, hi.longitude]);
    const top = _.max([lo.latitude, hi.latitude]);
    const bottom = _.min([lo.latitude, hi.latitude]);
    // For each feature, check if it is in the given bounding box
    for (const feature of feature_list) {
      if (feature.name.length < 1) return;
      if (feature.location.longitude >= left &&
        feature.location.longitude <= right &&
        feature.location.latitude >= bottom &&
        feature.location.latitude <= top) {
        call.write(feature);
      }
    }
    call.end();
  } catch (err) {
    console.error(err);
  }
}

/**
 * Calculate the distance between two points using the "haversine" formula.
 * The formula is based on http://mathforum.org/library/drmath/view/51879.html.
 * @param start The starting point
 * @param end The end point
 * @return The distance between the points in meters
 */
function getDistance(start, end) {
  function toRadians(num) {
    return num * Math.PI / 180;
  }
  let R = 6371000;  // earth radius in metres
  let lat1 = toRadians(start.latitude / COORD_FACTOR);
  let lat2 = toRadians(end.latitude / COORD_FACTOR);
  let lon1 = toRadians(start.longitude / COORD_FACTOR);
  let lon2 = toRadians(end.longitude / COORD_FACTOR);

  let deltalat = lat2-lat1;
  let deltalon = lon2-lon1;
  let a = Math.sin(deltalat/2) * Math.sin(deltalat/2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltalon/2) * Math.sin(deltalon/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * recordRoute handler. Gets a stream of points, and responds with statistics
 * about the "trip": number of points, number of known features visited, total
 * distance traveled, and total time spent.
 */
async function recordRoute(call, callback) {
  let point_count = 0;
  let feature_count = 0;
  let distance = 0;
  let previous = null;
  // Start a timer
  let start_time = process.hrtime();
  call.on('data', function (point) {
    try {
      point_count += 1;
      if (checkFeature(point.latitude, point.longitude).name.length > 1) feature_count += 1;
      /* For each point after the first, add the incremental distance from the
      * previous point to the total distance value */
      if (previous != null) {
        distance += getDistance(previous, point);
      }
      previous = point; 
    } catch (err) {
      console.error(err);
    }
  });
  call.on('end', function() {
    try {
      callback(null, {
        point_count: point_count,
        feature_count: feature_count,
        // Cast the distance to an integer
        distance: distance | 0,
        // End the timer
        elapsed_time: process.hrtime(start_time)[0]
      }); 
    } catch (error) {
      console.error(err);
    }
  });
}

async function routeChat(call) {
  call.on('data', function(streamData) {
    try {
      const { location, message, counter } = streamData;
      call.write({
        location,
        message: message + '\nreply ke ' + counter,
        counter
      })
    } catch (err) {
      console.error(err);
    }
  })
  call.on('end', function() {
    try {
      console.log('end dari server');
      call.end();
    } catch (err) {
      console.error(err);
    }
  });
}

fs.readFile(path.resolve(__dirname, '..', 'db', 'route_guide_db.json'), function(err, data) {
  if (err) throw err;
  feature_list = JSON.parse(data);
});

module.exports = {
  getFeature,
  listFeatures,
  recordRoute,
  routeChat
}
