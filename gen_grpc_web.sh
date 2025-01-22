#!/bin/bash

# For JS web-client
mkdir -p grpc-web/js/pb/example
rm -f grpc-web/js/pb/example/*.js
protoc -I=proto example.proto \
  --js_out=import_style=commonjs:grpc-web/js/pb/example \
  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:grpc-web/js/pb/example

# For TS web-client
mkdir -p grpc-web/ts/generated
rm -f grpc-web/ts/generated/*.ts
rm -f grpc-web/ts/generated/*.js
protoc -I=proto example.proto \
  --js_out=import_style=commonjs:grpc-web/ts/generated \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:grpc-web/ts/generated