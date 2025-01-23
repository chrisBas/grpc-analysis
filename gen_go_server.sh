#!/bin/bash

# go-server
mkdir -p go-server/pb/example
rm -f go-server/pb/example/*.go
protoc -I proto \
    --go_out go-server \
    --go-grpc_out go-server \
    --go_opt module=server \
    --go-grpc_opt module=server \
    --go_opt Mexample.proto=server/pb/example \
    --go-grpc_opt Mexample.proto=server/pb/example \
    example.proto

# grpc stubs
mkdir -p grpc-gateway/go-proxy/pb/example
rm -f grpc-gateway/go-proxy/pb/example/*.go
protoc -I proto \
    --go_out grpc-gateway/go-proxy \
    --go-grpc_out grpc-gateway/go-proxy \
    --go_opt module=gateway \
    --go-grpc_opt module=gateway \
    --go_opt Mexample.proto=gateway/pb/example \
    --go-grpc_opt Mexample.proto=gateway/pb/example \
    example.proto
# gateway stubs
mkdir -p grpc-gateway/go-proxy/pb/gateway
rm -f grpc-gateway/go-proxy/pb/gateway/*.go
protoc -I proto \
    --grpc-gateway_out grpc-gateway/go-proxy/pb/gateway \
    --grpc-gateway_opt paths=source_relative \
    --grpc-gateway_opt generate_unbound_methods=true \
    --grpc-gateway_opt standalone=true \
    --grpc-gateway_opt Mexample.proto=gateway/pb/example \
    example.proto
# openapi stubs
mkdir -p pb/openapi
rm -f pb/openapi/*.json
protoc -I proto \
    --openapiv2_out ./pb/openapi \
    --openapiv2_opt generate_unbound_methods=true \
    --openapiv2_opt output_format=json \
    --openapiv2_opt allow_merge=true \
    --openapiv2_opt merge_file_name=api \
    --openapiv2_opt Mexample.proto=gateway/pb/example \
    example.proto
