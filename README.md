# Running Locally

```
# Generate Protobuf files for go and js
./gen_go_server.sh
./gen_grpc_web.sh

# client (JS)
cd grpc-web/js
# install dependencies
npm i
# build client files
npm run build
# host static files (using python http-server)
npm start

# server
cd go-server
# install dependencies
go mod download
# run server
go run *.go

# envoy
./run_envoy_in_docker.sh
```