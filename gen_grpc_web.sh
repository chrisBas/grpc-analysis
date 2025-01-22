#!/bin/bash

mkdir -p grpc-web/js/pb/example
protoc -I=proto example.proto \
  --js_out=import_style=commonjs:grpc-web/js/pb/example \
  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:grpc-web/js/pb/example