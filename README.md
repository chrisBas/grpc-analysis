# Verdict

Grpc-Gateway is the best option for a setup where the client is the browser.  This is counter-intuitive because grpc-web is binary and should have a larger compression and should be able to be handled simpler but this is not the case for several reasons.  These reasons include: browsers use base64 encoded strings and have to be deserialized to binary before they can be processed by the client, maybe the browser is buffering a lot of the data before it can be processed, and to make matters worse when trying to optimize, grpc-web cannot utilize compression like gzip currently - so in cases where we are sending large amounts of data, grpc-web is not the best option.

It also appears from testing directly in node compared with the browser that the browser is adding signficant delays to the grpc-web responses; node was completing the same request in ~30s that the browser was taking ~60sec for.  Beyond that, i did a quick test to check if maybe it was base64 to binary to js objects that was taking up the time and in the same amount of responses (1000 request at 1MB per) it appears deserializing base64 to binary to js objects is not the issue as it was taking a total time of ~2587ms.

As far as Bi-Directional Streaming (AKA Bidi) goes, neither grpc-web nor grpc-gateway support this.  However; there is a nice grpc-gateway go library that requires 2 lines of code in the grpc-gateway go proxy code to enable web-sockets.  This is a nice feature and is a plus for grpc-gateway.  But, because unidirectional streams are supported by both grpc-web and grpc-gateway and this is from the server to the client, this alone is not a reason to choose grpc-gateway over grpc-web.  That said, the ability to use web-sockets does mean we can get past the 6-stream max hard limit that browsers have for HTTP 1.

# Analysis

As a part of the analysis, I will be comparing:

- Descriptive Analysis - a general take on if it is good/bad and why i think so
- Performance Large Msg - Sening/Receiving ~1MB (to an echo service) to see how fast it is for reuqests/responses (including serialization)
- Performance Small Msg - Sening/Receiving ~400Bytes (to an echo service) to see how fast it is for reuqests/responses (including serialization)
- 11mins of Streaming - I chose 11 minutes to see if there were any blockers preventing the stream from running for a *long time*, this also tells the kB returned for a basic response of {msg:string, type: int/enum} for comparrison purposes
- Max # of Streams - this is to determine any browser limits to how many streams can be running at a given time

| GRPC SPEC | Language | Extra Server | Description | Can Compress | Descriptive Analysis | Performance Large Msg (before compression) | Performance Small Msg | 11mins of Streaming | Max # of Streams |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| grpc-web | JS | Envoy | - | No | I prefer TS to JS | -Request Fails- | 4.102kB/s (42.0kB/10.24s) | Success (28.2kB) | 6 (MS Edge v132.0.2957.127) |
| grpc-web | TS | Envoy | using protoc grpc-web | No | Annoying to work with; generated TS has to be in separate Package | -Request Fails- | TBD | Success (28.2kB) | 6 (MS Edge v132.0.2957.127) |
| grpc-web | TS | Envoy | using protoc protobuf-ts | No | Good, but requires Envoy Proxy | 19.273MB/s (1,333MB/69.164s) | 4.14kB/s (42.4kB/10.24s) | Success (28.2kB) | 6 (MS Edge v132.0.2957.127) |
| grpc-web | TS | Grpc-Web Go Proxy | using protoc protobuf-ts | TBD | Good, but requires Grpc-Web Go Proxy.  Browser base64 encodes binary, adding ~33% to the payload size(s) and incurrs a substantial serialization | 21.457MB/s (1,333MB/62.123s) | 4.14kB/s (42.4kB/10.24s) | Success (28.2kB) | 6 (MS Edge v132.0.2957.127) |
| grpc-gateway | TS | Grpc-Gateway Go Proxy | - | Yes | Best Option - requires a Grpc-Gateway Go Proxy but browsers can just deal with JSON so well that 1GB/Transfer over a 10sec stream was 1.884sec longer.  Not to mention the compression of 1G to 1M (in my particuar test case) | 84.147MB/s (1,000MB/11.884s) | 5.95kB/s (62.3kB/10.47s) | Success (41.3kB) | 6 (MS Edge v132.0.2957.127) |

# Running grpc-gateway Locally with Grpc-Gateway Proxy

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

# Running grpc-web-web Locally with Envoy

```
# Generate Protobuf files for go and js
./gen_go_server.sh
./gen_grpc_web.sh

# envoy
cd grpc-web/envoy
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
yarn install
# run dev server with vite (yarn is needed b/c we use 'link:' in package.json)
yarn run dev

# client (TS2) - only use if you are running the TS2 client ofcourse
cd grpc-web/ts2
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

# Running grpc-web-web Locally with Envoy

```
# Generate Protobuf files for go and js
./gen_go_server.sh
./gen_grpc_web.sh

# grpc-web go proxy (this is installed separate from the apps in this repo)
cd ../
git clone git@github.com:improbable-eng/grpc-web.git grpc-web-go-proxy
cd grpc-web-go-proxy
go install ./go/grpcwebproxy
grpcwebproxy --backend_addr=localhost:9090 --run_tls_server=false --allow_all_origins --server_http_max_write_timeout=3600s

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
yarn install
# run dev server with vite (yarn is needed b/c we use 'link:' in package.json)
yarn run dev

# client (TS2) - only use if you are running the TS2 client ofcourse
cd grpc-web/ts2
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

## Notes

- It appears envoy compression does not work with grpc-web and there is an open issue in the envoy repo for this (see ref below)

## References

- [grpc-web](https://github.com/grpc/grpc-web)
- [grpc-web helloworld](https://github.com/grpc/grpc-web/tree/master/net/grpc/gateway/examples/helloworld)
- [grpc-web typescript](https://github.com/grpc/grpc-web/blob/master/net/grpc/gateway/examples/echo/ts-example/README.md)
- [grpc-web vite](https://github.com/a2not/vite-grpc-web)
- _neat to know_ [multiple go versions](https://go.dev/doc/manage-install)
- [installing envoy locally](https://www.envoyproxy.io/docs/envoy/latest/start/install)
- [running envoy locally](https://www.envoyproxy.io/docs/envoy/latest/start/quick-start/run-envoy)
- [grpc-web-proxy in go](https://github.com/improbable-eng/grpc-web/tree/master/go/grpcwebproxy)
- [envoy open compression issue](https://github.com/envoyproxy/envoy/issues/6292)
- [grpc-web compression issue](https://github.com/grpc/grpc-web/issues/561)