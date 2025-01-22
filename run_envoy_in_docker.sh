#!/bin/bash

# stop any running instances of envoy on port 8080
docker stop  $(docker ps | grep 8080 | awk '{print $1}')

docker run -d -v "$(pwd)"/grpc-web/envoy.yaml:/etc/envoy/envoy.yaml:ro -p 8080:8080 -p 9901:9901 envoyproxy/envoy:v1.22.0