#!/bin/bash

# For JS web-client
mkdir -p grpc-web/js/pb/example
protoc -I=proto example.proto \
  --js_out=import_style=commonjs:grpc-web/js/pb/example \
  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:grpc-web/js/pb/example

# For TS web-client
mkdir -p grpc-web/ts/src/pb/example
protoc -I=proto example.proto \
  --js_out=import_style=commonjs:grpc-web/ts/src/pb/example \
  --grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:grpc-web/ts/src/pb/example