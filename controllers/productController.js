const grpc = require('@grpc/grpc-js');
const path = require('path');
const fs = require('fs');

let product_list, seller_list;

fs.readFile(path.resolve(__dirname, '..', 'db', 'product_db.json'), function (err, data) {
  if (err) throw err;
  product_list = JSON.parse(data);
});

fs.readFile(path.resolve(__dirname, '..', 'db', 'seller_db.json'), function (err, data) {
  if (err) throw err;
  seller_list = JSON.parse(data);
});

function listProducts(call) {
  try {
    // throw new Error('throw error from server'); // work inside try or outer
    // let data = []; // jika diresponse hanya "let data;" grpc akan auto generate mengikuti protofilenya
    for (const product of product_list) {
      for (const seller of seller_list) {
        if (product.sid === seller.id) {
          // CARA1 berangsur-angsur
          call.write({
            code: grpc.status.OK,
            details: 'ok',
            data: [{
              id: product.id,
              name: product.name,
              seller: {
                sid: seller.id,
                name: seller.name
              }
            }]
          });

          // CARA2 disekaligusin
          // data.push({
          //   id: product.id,
          //   name: product.name,
          //   seller: {
          //     sid: seller.id,
          //     name: seller.name
          //   }
          // });
        }
      }
    }
    // CARA2 disekaligusin
    // call.write({
    //   code: grpc.status.OK,
    //   details: 'ok',
    //   data
    // });
    call.end();
  } catch (err) {
    call.emit('error', {
      code: grpc.status.UNKNOWN,
      details: err.message
    })
  }
}

// list products and list sellers
function listProducts1(call) {
  try {
    // CARA1 berangsur-angsur
    // for (const product of product_list) {
    //   for (const seller of seller_list) {
    //     if (product.sid === seller.id) {
    //       call.write({
    //         products: [product],
    //         sellers: [seller]
    //       });
    //     }
    //   }
    // }
    // CARA2 disekaligusin
    call.write({
      products: product_list,
      sellers: seller_list,
    })
    call.end();
  } catch (err) {
    console.error(err);
  }
}

// list products yang didalamnya terdapat informasi seller
function listProducts2(call) {
  try {
    // let data = []; // jika diresponse hanya "let data;" grpc akan auto generate mengikuti protofilenya
    for (const product of product_list) {
      for (const seller of seller_list) {
        if (product.sid === seller.id) {
          // CARA1 berangsur-angsur
          call.write({
            data: [{
              id: product.id,
              name: product.name,
              seller: {
                sid: seller.id,
                name: seller.name
              }
            }]
          });

          // CARA2 disekaligusin
          // data.push({
          //   id: product.id,
          //   name: product.name,
          //   seller: {
          //     sid: seller.id,
          //     name: seller.name
          //   }
          // });
        }
      }
    }
    // CARA2 disekaligusin
    // call.write({
    //   data
    // })
    call.end();
  } catch (err) {
    console.error(err);
  }
}

function detailProduct(call, callback) {
  try {
    console.log(call.request);
    // throw new Error('throw error from server'); // work inside try or outer
    for (const product of product_list) {
      if (product.id !== call.request.id) continue;
      for (const seller of seller_list) {
        if (product.sid === seller.id) {
          // CARA1 berangsur-angsur
          callback(null, {
            code: grpc.status.OK,
            details: 'ok',
            data: {
              id: product.id,
              name: product.name,
              seller: {
                sid: seller.id,
                name: seller.name
              }
            }
          });
        }
      }
    }
  } catch (err) {
    callback({
      code: grpc.status.UNKNOWN,
      details: err.message
    });
  }
}

function searchProduct(call, callback) {
  try {
    // throw new Error('throw error from server'); // work inside try or outer
    for (const product of product_list) {
      if (product.id !== call.request.id) continue;
      for (const seller of seller_list) {
        if (product.sid === seller.id) {
          let data = {
            id: product.id,
            name: product.name,
            seller: {
              sid: seller.id,
              name: seller.name
            }
          };
          // data object either string kosong
          // https://stackoverflow.com/questions/71339570/is-it-a-good-way-to-declare-a-string-field-as-json-in-grpc-proto
          // https://stackoverflow.com/questions/59530736/how-to-achieve-dynamic-custom-fields-of-different-data-type-using-grpc-proto/59568458#59568458
          callback(null, {
            code: grpc.status.OK,
            details: 'ok',
            data,
          });
        }
      }
    }
  } catch (err) {
    callback({
      code: grpc.status.UNKNOWN,
      details: err.message
    });
  }
}

module.exports = {
  listProducts,
  listProducts1,
  listProducts2,
  detailProduct,
  searchProduct,
}
