package main

import (
	"compress/gzip"
	"context"
	"flag"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/grpclog"

	gw "gateway/pb/gateway"

	"github.com/tmc/grpc-websocket-proxy/wsproxy"
)
  
  var (
	// command-line options:
	// gRPC server endpoint
	grpcServerEndpoint = flag.String("grpc-server-endpoint",  "localhost:9090", "gRPC server endpoint")
  )
  
  func run() error {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
  
	// Register gRPC server endpoint
	// Note: Make sure the gRPC server is running properly and accessible
	mux := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	err := gw.RegisterExampleHandlerFromEndpoint(ctx, mux,  *grpcServerEndpoint, opts)
	if err != nil {
	  return err
	}
  
	// Start HTTP server (and proxy calls to gRPC server endpoint)
	port := 8080
	fmt.Printf("Server is listening on port %d\n", port)
	return http.ListenAndServe(fmt.Sprintf(":%d", port), middleware(mux))
  }

  func middleware(next http.Handler) http.Handler {
	return cors(wsproxy.WebsocketProxy(gzipMiddleware(next)))
}

func gzipMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
            gz := gzip.NewWriter(w)
            defer gz.Close()
            w.Header().Set("Content-Encoding", "gzip")
            w = gzipResponseWriter{Writer: gz, ResponseWriter: w}
        }
        next.ServeHTTP(w, r)
    })
}

type gzipResponseWriter struct {
    io.Writer
    http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
    return w.Writer.Write(b)
}

func (w gzipResponseWriter) Flush() {
	w.Writer.(*gzip.Writer).Flush()
	w.ResponseWriter.(http.Flusher).Flush()
}

  func cors(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// if allowedOrigin(r.Header.Get("Origin")) {
		w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization, ResponseType")
		// }
		if r.Method == "OPTIONS" {
			return
		}
		h.ServeHTTP(w, r)
	})
  }
  
  func main() {
	flag.Parse()
  
	if err := run(); err != nil {
	  grpclog.Fatal(err)
	}
  }