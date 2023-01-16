async function sayHi(call, callback) {
  callback(null, {message: 'Hi ' + call.request.name});
}

module.exports = {
  sayHi
};
