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

module.exports = {
  listProducts,
  listProducts1,
}
