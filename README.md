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

## References

- [grpc-web](https://github.com/grpc/grpc-web)
- [grpc-web helloworld](https://github.com/grpc/grpc-web/tree/master/net/grpc/gateway/examples/helloworld)
- [grpc-web typescript](https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/echo/ts-example/README.md)
- [grpc-web vite](https://github.com/a2not/vite-grpc-web)
- _neat to know_ [multiple go versions](https://go.dev/doc/manage-install)