#!/bin/bash

# For JS web-client
mkdir -p grpc-web/js/pb/example
rm -f grpc-web/js/pb/example/*.js
protoc -I proto \
  --js_out import_style=commonjs:grpc-web/js/pb/example \
  --grpc-web_out import_style=commonjs,mode=grpcwebtext:grpc-web/js/pb/example \
  example.proto common.proto

# For TS web-client
mkdir -p grpc-web/ts/generated
rm -f grpc-web/ts/generated/*.ts
rm -f grpc-web/ts/generated/*_pb.js
protoc -I proto \
  --js_out import_style=commonjs:grpc-web/ts/generated \
  --grpc-web_out import_style=typescript,mode=grpcwebtext:grpc-web/ts/generated \
  example.proto common.proto


# For TS2 web-client
mkdir -p grpc-web/ts2/src/generated
rm -f grpc-web/ts2/src/generated/*.ts
protoc -I proto \
  --ts_opt eslint_disable \
  --ts_out grpc-web/ts2/src/generated \
  example.proto common.proto
  
  # For node web-client
mkdir -p grpc-web/node/src/generated
rm -f grpc-web/node/src/generated/*.ts
protoc -I proto \
  --ts_opt eslint_disable \
  --ts_out grpc-web/node/src/generated \
  example.proto common.proto
  