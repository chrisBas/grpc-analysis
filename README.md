# Running grpc-gateway Locally

```
# Generate Protobuf files for go and js
./gen_go_server.sh
./gen_grpc_web.sh

# gateway proxy
cd grpc-gateway/go-proxy
# install dependencies
go mod download
go run main.go

# client (TS) - only use if you are running the TS client ofcourse
cd grpc-gateway/ts
# install dependencies
npm i
# run dev server with vite
npm run dev

# server
cd go-server
# install dependencies
go mod download
# run server
go run *.go
```

# Running grpc-web-web Locally

```
# Generate Protobuf files for go and js
./gen_go_server.sh
./gen_grpc_web.sh

# envoy
./run_envoy_in_docker.sh

# client (JS) - only use if you are running the JS client ofcourse
cd grpc-web/js
# install dependencies
npm i
# build client files
npm run build
# host static files (using python http-server)
npm start

# client (TS) - only use if you are running the TS client ofcourse
cd grpc-web/ts
# install dependencies
npm i
# run dev server with vite
npm run dev

# server
cd go-server
# install dependencies
go mod download
# run server
go run *.go
```

## References

- [grpc-web](https://github.com/grpc/grpc-web)
- [grpc-web helloworld](https://github.com/grpc/grpc-web/tree/master/net/grpc/gateway/examples/helloworld)
- [grpc-web typescript](https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/echo/ts-example/README.md)
- [grpc-web vite](https://github.com/a2not/vite-grpc-web)
- _neat to know_ [multiple go versions](https://go.dev/doc/manage-install)