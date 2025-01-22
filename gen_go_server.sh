#!/bin/bash

mkdir -p go-server/pb/example
protoc -I=proto example.proto \
    --go_out=go-server --go-grpc_out=go-server \
    --go_opt=module=server --go-grpc_opt=module=server \
    --go_opt=Mexample.proto=server/pb/example --go-grpc_opt=Mexample.proto=server/pb/example