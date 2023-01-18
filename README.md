# Boilerplate of Node JS gRPC using MVC Architecture

...

## Folders & Files
- clients
for test the rpc, you can delete this folder
- configs
template config files
- controllers
core logic
- routes
load the protobuf, and define the function should be called
- index.js
the gRPC server running

...

This was built using Node JS 18.13.0

## Reference
- https://grpc.io/docs/languages/node/basics/ (Was accessed: 16 Jan 2023)
- https://developers.google.com/protocol-buffers/docs/proto3 (Was accessed: 16 Jan 2023)
- https://protobuf.dev/programming-guides/proto3/#json (Was accessed: 17 Jan 2023)
- https://github.com/grpc/grpc-node/ (Was accessed: 16 Jan 2023)
- https://github.com/avinassh/grpc-errors (Was accessed: 17 Jan 2023)
- https://grpc.io/blog/ (Was accessed: 17 Jan 2023)

## issue
- end not emitted on the client when server streaming https://github.com/grpc/grpc-web/issues/289
- i think i know, hopefully. bcs in the example it works
