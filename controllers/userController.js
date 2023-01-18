const grpc = require('@grpc/grpc-js');
const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

let user_db, shipper_addr_db;

fs.readFile(path.resolve(__dirname, '..', 'db', 'user_db.json'), function(err, data) {
  if (err) throw err;
  user_db = JSON.parse(data);
});
fs.readFile(path.resolve(__dirname, '..', 'db', 'shipper_address_db.json'), function(err, data) {
  if (err) throw err;
  shipper_addr_db = JSON.parse(data);
});

async function detailUser(call, callback) {
  try {
    const { id } = call.request;
    if (!id) {
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        details: "parameter id not valid"
      });
      return;
    }
    // find user
    let data = {};
    for (const user of user_db) {
      if (user.id !== id) continue;
      data = {...user};
    }
    if (Object.keys(data).length < 1) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "user not found"
      });
      return;
    }
    // child user shippers
    data.shipper_address = [];
    for (const shipper of shipper_addr_db) {
      if (shipper.uid !== data.id) continue;
      data.shipper_address.push({...shipper});
    }
    callback(null, {
      code: grpc.status.OK,
      details: "ok",
      data,
    });
  } catch (err) {
    callback({
      code: grpc.status.UNKNOWN,
      details: err.message
    }); 
  }
}

async function listUser(call, callback) {
  try {
    let data = [];
    for (const user of user_db) {
      user.shipper_address = [];
      for (const shipper of shipper_addr_db) {
        if (shipper.uid !== user.id) continue;
        user.shipper_address.push({...shipper});
      }
      data.push({...user});
    }
    callback(null, {
      code: grpc.status.OK,
      details: "ok",
      data,
    }); 
  } catch (err) {
    callback({
      code: grpc.status.UNKNOWN,
      details: err.message
    });
  }
}

async function addUser(call, callback) {
  let newUser = [];
  call.on('data', function(data) {
    try {
      // add user
      const user = {...data};
      user.id = user_db.slice(-1, user_db.length)[0].id + 1;
      delete user.shipper_address;
      user_db.push({...user});
      // add shipper
      for (const index in data.shipper_address) {
        data.shipper_address[index].id = shipper_addr_db.slice(-1, shipper_addr_db.length)[0].id + 1;
        data.shipper_address[index].uid = user.id;
        shipper_addr_db.push({...data.shipper_address[index]});
      }
      // response users shippers
      user.shipper_address = [...data.shipper_address];
      newUser.push({...user});
    } catch (err) {
      callback({
        code: grpc.status.UNKNOWN,
        details: err.message
      });
    }
  });
  call.on('end', function() {
    try {
      console.log('end of stream add user');
      setTimeout(() => {
        callback(null, {
          code: grpc.status.OK,
          details: 'ok',
          data: newUser
        });
      }, 1);
    } catch (err) {
      callback({
        code: grpc.status.UNKNOWN,
        details: err.message
      });
    }
  });
}

async function updateUser(call) {
  call.on('data', function(req) {
    try {
      const {id} = req;
      if (!id) {
        call.emit('error', {
          code: grpc.status.INVALID_ARGUMENT,
          details: 'id user required'
        });
        return;
      }
      // find user
      let updtUser = {};
      for (const index in user_db) {
        if (user_db[index].id !== id) continue;
        updtUser = {...req};
        updtUser.id = id;
        delete updtUser.shipper_address;
        user_db[index] = {...updtUser};
      }
      if (Object.keys(updtUser).length < 1) {
        call.emit('error', {
          code: grpc.status.NOT_FOUND,
          details: "user not found"
        });
        return;
      }
      // child user shippers
      updtUser.shipper_address = [];
      for (const index in shipper_addr_db) {
        if (shipper_addr_db[index].uid !== id) continue;
        for (const i in req.shipper_address) {
          if (shipper_addr_db[index].id !== req.shipper_address[i].id) continue;
          req.shipper_address[i].uid = id;
          updtUser.shipper_address.push({...req.shipper_address[i]});
          shipper_addr_db[index] = {...req.shipper_address[i]};
        }
      }
      call.write({
        code: grpc.status.OK,
        details: "ok",
        data: updtUser
      })
    } catch (err) {
      call.emit('error', {
        code: grpc.status.UNKNOWN,
        details: err.message
      });
    }
  });
  call.on('end', function() {
    console.log('end of stream update user');
    call.end();
  });
  call.on('error', function(err) {
    console.log('Error from client update user:', JSON.stringify(err));
  });
}

async function downloadUser(call) {
  try {
    // CARA 1 menggunakan file
    // const fileBuff = fs.readFileSync(path.resolve(__dirname, '..', 'db', 'user_db.json'));
    // for (const b of fileBuff) {
    //   call.write({fileChunk: Buffer.from([b])});
    // }
    // CARA 2 convert json to buffer(byte)
    const buffs = Buffer.from(JSON.stringify(user_db), 'ascii');
    for (const b of buffs) {
      call.write({fileChunk: Buffer.from([b])});
    }
    call.end();
  } catch (err) {
    call.emit('error', {
      code: grpc.status.UNKNOWN,
      details: err.message
    });
  }
}

module.exports = {
  detailUser,
  listUser,
  addUser,
  updateUser,
  downloadUser
}
