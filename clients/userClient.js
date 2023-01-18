const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const protoLoaderConfig = require('../configs/protoLoaderConf');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const PROTO_USER = path.resolve(__dirname, '..', 'proto', 'user.proto');
const packageUser = protoLoader.loadSync(PROTO_USER, protoLoaderConfig);
const protoUser = grpc.loadPackageDefinition(packageUser).user;

let target = 'localhost:' + process.env.PORT;
const client = new protoUser.User(target, grpc.credentials.createInsecure());

async function invokeDetailUser() {
  client.detailUser({id: 1}, function(err, resp) {
    try {
      if (err) {
        console.log('Error Response Detail User', JSON.stringify(err));
        return;
      }
      console.log('Response Detail User');
      console.log(resp);
      console.log('shipper_address:', resp.data.shipper_address);
    } catch (err) {
      console.error(err);
    }
  });
}

async function invokeListUser() {
  client.listUser({}, {deadline: Date.now()+5000}, function(err, resp) {
    try {
      if (err) {
        console.log('Error Response List User', JSON.stringify(err));
        return;
      }
      console.log('Response List User');
      console.log(resp);
    } catch (err) {
      console.error(err);
    }
  });
}

async function invokeAddUser() {
  const call = client.addUser({deadline: Date.now()+5000}, function(err, resp) {
    try {
      if (err) {
        console.log('Error Response Add User 1', JSON.stringify(err));
        return;
      }
      console.log('Response Add User');
      console.log(resp);
      console.log(resp.data[0].shipper_address);
    } catch (err) {
      console.error(err);
    }
  });
  try {
    call.on('error', function(err) {
      console.log('Error Response Add User 2', JSON.stringify(err));
    })
    const now = Date.now();
    call.write({
      fullname: "katar",
      email: "katar@gmail.com",
      phone: "81288789878",
      isact: 1,
      ctm: now,
      mtm: now,
      shipper_address: [
        {
          street: "jl kat raya",
          postalcode: "16488",
          village: "noxus village",
          district: "noxus district",
          state: "noxus state",
          ismain: 1
        }
      ]
    });
    call.end();
  } catch (err) {
    console.error(err);
  }
}

async function invokeUpdateUser() {
  try {
    const call = client.updateUser({deadline: Date.now()+5000});
    call.on('data', function(updtUser) {
      console.log('Response Update User', JSON.stringify(updtUser));
    });
    call.on('end', function() {
      console.log('End Stream Update User');
    });
    call.on('error', function(err) {
      console.log('Error Response Update User', JSON.stringify(err));
    });
    const now = Date.now();
    call.write({
      id: 2,
      fullname: "katar",
      email: "katar@gmail.com",
      phone: "81288789878",
      isact: 1,
      ctm: now,
      mtm: now,
      shipper_address: [
        {
          id: 2,
          street: "jl kat raya",
          postalcode: "16488",
          village: "noxus village",
          district: "noxus district",
          state: "noxus state",
          ismain: 1
        }
      ]
    });
    call.end();
  } catch (err) {
    console.error(err);
  }
}

async function invokeDownloadUser() {
  try {
    const call = client.downloadUser();
    fs.writeFileSync('user_db.json', '');
    const fd = fs.openSync('user_db.json', 'as');
    call.on('data', function({fileChunk}) {
      try {
        fs.writeSync(fd, fileChunk);
      } catch (err) {
        fs.closeSync(fd);
        console.error(err);
      }
    });
    call.on('end', function() {
      fs.closeSync(fd);
      console.log('End of Stream Download User');
    });
    call.on('error', function(err) {
      fs.closeSync(fd);
      console.log('Error Response User User', JSON.stringify(err));
    });
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  // invokeDetailUser();
  // invokeListUser();
  // invokeAddUser();
  invokeUpdateUser();
  // invokeDownloadUser();
  setTimeout(() => {
    invokeListUser();
  }, 5000);
}

main();
