#!/bin/bash

# stop any running instances of envoy on port 8090
docker stop  $(docker ps | grep 8090 | awk '{print $1}')

docker run -d -v "$(pwd)"/envoy.yaml:/etc/envoy/envoy.yaml:ro -p 8090:8090 -p 9901:9901 envoyproxy/envoy:v1.22.0